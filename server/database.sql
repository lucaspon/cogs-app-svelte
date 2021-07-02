create table public.insumos
(
    sku_insumo        varchar primary key,
    nome              varchar not null,
    unidade_de_medida varchar not null,
    descricao         varchar,
    fornecedor        varchar,
    tipo              varchar,
    moq               numeric
);

create table public.produtos
(
    sku_produto       varchar primary key,
    nome              varchar not null,
    variant           varchar,
    unidade_de_medida varchar not null,
    preco_de_venda    numeric,
    created_at        date default (current_date)
);

create table public.compras
(
    id             serial primary key,
    data           date    not null,
    fornecedor     varchar,
    sku_insumo     varchar not null,
    quantidade     numeric not null,
    custo_unitario numeric not null,
    total          numeric generated always as ( custo_unitario * quantidade ) stored,

    CONSTRAINT sku_insumo
        FOREIGN KEY (sku_insumo)
            REFERENCES insumos (sku_insumo)
);

create table public.lotes
(
    row_id               serial primary key,
    lote_id              varchar not null,
    data                 date    not null,
    sku_produto          varchar not null,
    quantidade_produzida numeric not null,

    CONSTRAINT sku_produto
        FOREIGN KEY (sku_produto)
            REFERENCES produtos (sku_produto)
);

create table public.lotes_bom
(
    row_id                     serial primary key,
    lote_id                    numeric not null,
    sku_produto                varchar not null,
    sku_insumo                 varchar not null,
    consumo_unit numeric not null,

    CONSTRAINT sku_produto
        FOREIGN KEY (sku_produto)
            REFERENCES produtos (sku_produto),
    CONSTRAINT sku_insumo
        FOREIGN KEY (sku_insumo)
            REFERENCES insumos (sku_insumo)
);

create table vendas
(
    id_pedido   varchar not null,
    data        date    not null,
    sku_produto varchar not null,
    quantidade  numeric not null,
    preco_venda numeric not null,
    total       numeric generated always as ( preco_venda * quantidade ) stored
);

------------------------------------- views

-- estoques insumos
create or replace view estoques_insumos as
with recursive
    rt1 as (
        with movimentos as (
            with saidas as (
                select lb.lote_id                                   as id,
                       data,
                       sku_insumo,
                       -sum(quantidade_produzida * lb.consumo_unit) as movimento_qtd,
                       null::numeric                                as custo_unitario,
                       null::numeric                                as total,
                       'saída'                                      as tipo
                from lotes
                         left join lotes_bom lb on lotes.lote_id = lb.lote_id
                group by lb.lote_id, data, sku_insumo
                order by sku_insumo, data),

                 entradas as (
                     select id::varchar,
                            data,
                            sku_insumo,
                            quantidade as movimento_qtd,
                            custo_unitario,
                            total,
                            'entrada'  as tipo
                     from compras)
            select *
            from saidas
            union all
            select *
            from entradas
            order by sku_insumo, data, tipo)
        select movimentos.*,
               sum(movimento_qtd) over (partition by sku_insumo order by data, tipo) as saldo_qtd,
               row_number() over (partition by sku_insumo order by data, tipo)       as rn
        from movimentos),

    cte as (
        select id,
               data,
               sku_insumo,
               movimento_qtd,
               total,
               tipo,
               saldo_qtd,
               rn,
               custo_unitario as custo_medio
        from rt1
        where rn = 1

        union all

        select sub.id,
               sub.data,
               sub.sku_insumo,
               sub.movimento_qtd,
               sub.total,
               sub.tipo,
               sub.saldo_qtd,
               sub.rn,
               case
                   when sub.tipo = 'saída' then main.custo_medio
                   else (((sub.saldo_qtd - sub.movimento_qtd) * main.custo_medio +
                          sub.movimento_qtd * sub.custo_unitario) /
                         ((sub.saldo_qtd - sub.movimento_qtd) + sub.movimento_qtd))::numeric(10, 4) end as custo_medio
        from cte as main
                 join rt1 as sub on (main.sku_insumo = sub.sku_insumo and main.rn + 1 = sub.rn)
    )
select id,
       rn,
       data,
       tipo,
       sku_insumo,
       movimento_qtd,
       saldo_qtd,
       (total / movimento_qtd)::numeric(10, 2)                    as custo_unit_de_entrada,
       custo_medio::numeric(10, 2),
       case
           when tipo = 'entrada' then total::numeric(10, 2)
           else (custo_medio * movimento_qtd)::numeric(10, 2) end as movimento_brl,
       (custo_medio * saldo_qtd)::numeric(10, 2)                  as saldo_brl
from cte
order by sku_insumo, rn;

-- estoques produtos
create or replace view estoques_produtos as
with recursive
    rt1 as (
        with movimentos as (
            with entradas as (
                select lotes.lote_id::varchar                                                         as id_mov,
                       lotes.data,
                       lotes.sku_produto,
                       quantidade_produzida                                                           as quantidade,
                       sum(lb.consumo_unit * ei.custo_medio)                                          as custo_unit,
                       (sum(lb.consumo_unit * ei.custo_medio) * quantidade_produzida)::numeric(10, 2) as mov_brl,
                       'entrada'                                                                      as tipo
                from lotes
                         left join lotes_bom lb on lotes.lote_id = lb.lote_id and lb.sku_produto = lotes.sku_produto
                         left join estoques_insumos ei
                                   on ei.id = lb.lote_id and ei.sku_insumo = lb.sku_insumo and tipo = 'saída'
                group by lotes.row_id, lotes.data, lotes.sku_produto, quantidade_produzida, tipo
            ),
                 saidas as (
                     select id_pedido::varchar as id_mov,
                            data,
                            sku_produto,
                            -quantidade,
                            null::numeric      as custo_unit,
                            null::numeric      as mov_brl,
                            'saída'            as tipo
                     from vendas
                 )
            select *
            from entradas
            union all
            select *
            from saidas
        )
        select *,
               sum(quantidade) over (partition by sku_produto order by data, tipo) as saldo_qtd,
               row_number() over (partition by sku_produto order by data, tipo)    as rn
        from movimentos),

    cte as (
        select id_mov,
               data,
               sku_produto,
               quantidade,
               mov_brl,
               tipo,
               saldo_qtd,
               rn,
               custo_unit
        from rt1
        where rn = 1

        union all

        select sub.id_mov,
               sub.data,
               sub.sku_produto,
               sub.quantidade,
               sub.mov_brl,
               sub.tipo,
               sub.saldo_qtd,
               sub.rn,
               case
                   when sub.tipo = 'saída' then main.custo_unit
                   else (((sub.saldo_qtd - sub.quantidade) * main.custo_unit +
                          sub.quantidade * sub.custo_unit) /
                         ((sub.saldo_qtd - sub.quantidade) + sub.quantidade))::numeric(10, 4) end as custo_unit
        from cte as main
                 join rt1 as sub on (main.sku_produto = sub.sku_produto and main.rn + 1 = sub.rn)
    )
select id_mov,
       data,
       sku_produto,
       rn,
       tipo,
       quantidade,
       (mov_brl / quantidade)::numeric(10, 4)                 as custo_unit_lote,
       saldo_qtd,
       custo_unit                                             as custo_medio,
       case
           when tipo = 'entrada' then mov_brl::numeric(10, 2)
           else (custo_unit * quantidade)::numeric(10, 2) end as mov_brl,
       round(custo_unit * saldo_qtd, 2)                       as saldo_brl
from cte
order by sku_produto, rn;