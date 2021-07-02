const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

// middleware ---------
app.use(cors());
app.use(express.json());

// ROUTES -----------------------------------------------

paths = [
    '/insumos',
    '/produtos',
    '/compras',
    '/lotes',
    '/lotes_bom',
    '/vendas',
    '/estoques_insumos',
    '/estoques_produtos'
]

spec_paths = [
    '/insumos/:sku_insumo',
    '/produtos/:sku_produto',
    '/compras/:id',
    '/lotes/:id_lote',
    '/lotes_bom/:id_lote',
    '/vendas/:id_pedido',
    '/estoques_insumos/:sku_insumo',
    '/estoques_produtos/:sku_produto'
]

// QUERIES -----------------------------------------------

get_queries = [
    "SELECT * FROM public.insumos ORDER BY sku_insumo;",
    "SELECT * FROM public.produtos ORDER BY sku_produto;",
    "SELECT * FROM public.compras ORDER BY id;",
    "SELECT * FROM public.lotes ORDER BY lote_id;",
    "SELECT * FROM public.lotes_bom ORDER BY lote_id, sku_produto, sku_insumo;",
    "SELECT * FROM public.vendas ORDER BY id_pedido;",
    "SELECT * FROM public.estoques_insumos ORDER BY sku_insumo, rn;",
    "SELECT * FROM public.estoques_produtos ORDER BY sku_produto, rn;"
]

get_spec_queries = [
    "SELECT * FROM public.insumos WHERE sku_insumo = $1;",
    "SELECT * FROM public.produtos WHERE sku_produto = $1;",
    "SELECT * FROM public.compras WHERE id = $1;",
    "SELECT * FROM public.lotes WHERE lote_id = $1;",
    "SELECT * FROM public.lotes_bom WHERE lote_id = $1;",
    "SELECT * FROM public.vendas WHERE id_pedido = $1;",
    "SELECT * FROM public.estoques_insumos WHERE sku_insumo = $1 ORDER BY rn;",
    "SELECT * FROM public.estoques_produtos WHERE sku_produto = $1 ORDER BY rn;"
]

post_req_queries = [
    "INSERT INTO public.insumos VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    "INSERT INTO public.produtos VALUES ($1, $2, $3, $4, $5) RETURNING *",
    "INSERT INTO public.compras VALUES ($1, $2, $3, $4, $5) RETURNING *",
    "INSERT INTO public.lotes VALUES ($1, $2, $3, $4) RETURNING *",
    "INSERT INTO public.lotes_bom VALUES ($1, $2, $3, $4) RETURNING *",
    "INSERT INTO public.vendas VALUES ($1, $2, $3, $4, $5) RETURNING *"
]

put_req_queries = [
    "UPDATE public.insumos SET sku_insumo = $1, nome = $2, unidade_de_medida = $3, descricao = $4, fornecedor = $5, tipo = $6, moq = $7 WHERE sku_insumo = $8",
    "UPDATE public.produtos SET sku_produto = $1, nome = $2, variant = $3, unidade_de_medida = $4, preco_de_venda = $5 WHERE sku_produto = $6",
    "UPDATE public.compras SET data = $1, fornecedor = $2, sku_insumo = $3, quantidade = $4, custo_unitario = $5 WHERE id = $8",
    "UPDATE public.lotes SET lote_id = $1, data = $2, sku_produto = $3, quantidade_produzida = $4 WHERE sku_insumo = $5",
    "UPDATE public.lotes_bom SET lote_id = $1, sku_produto = $2, sku_insumo = $3, consumo_unit = $4 WHERE row_id = $5",
    "UPDATE public.vendas SET id_pedido = $1, data = $2, sku_produto = $3, quantidade = $4, preco_venda = $5 WHERE id_pedido = $6"
]

delete_req_queries = [
    "DELETE FROM public.insumos WHERE sku_insumo = $1",
    "DELETE FROM public.produtos WHERE sku_produto = $1",
    "DELETE FROM public.compras WHERE id = $1",
    "DELETE FROM public.lotes WHERE lote_id = $1",
    "DELETE FROM public.lotes_bom WHERE row_id = $1",
    "DELETE FROM public.vendas WHERE id_pedido = $1"
]

// REQUESTS ---------------------------------------------------

// get all
app.get(paths, async (req, res) => {
    try {
        i = paths.indexOf(req.path) // identificar rota para determinar request
        const query = await pool.query(get_queries[i]) // fazer request HTTP p/ base de dados

        res.json(query.rows); // retornar dados
    } catch (err) {
        console.error(err.message)
    }
});

// get especifico
app.get(spec_paths, async (req, res) => {
    try {
        match = req.path.split('/')[1]
        i = paths.indexOf('/' + match)  // identificar rota para determinar request
        const id = req.path.split('/')[req.path.split('/').length - 1]; // extrair id

        const query = await pool.query(get_spec_queries[i], [id]) // obter dados da DB

        if (query.rows.length === 1) {
            res.json(query.rows[0])
        }
        if (query.rows.length > 1) {
            res.json(query.rows)
        }
        else {
            res.json('No matches.')
        }

    } catch (err) {
        console.error(err.message);
    }
});


// criar
app.post(paths, async (req, res) => {
    try {
        i = paths.indexOf(req.path) // identificar rota para determinar request

        const reqParamCount = post_req_queries[i].split('$').length - 1
        var reqArray = Object.values(req.body)
        reqArray.length = reqParamCount

        const query = await pool.query(post_req_queries[i], reqArray)

        res.json(query.rows);
    } catch (err) {
        console.log(err.message);
    }
});


// update específico
app.put(spec_paths, async (req, res) => {
    try {
        match = req.path.split('/')[1]
        i = paths.indexOf('/' + match)  // identificar rota para determinar request
        const id = req.path.split('/')[req.path.split('/').length - 1]; // extrair id

        const reqParamCount = put_req_queries[i].split('$').length - 1
        var reqArray = Object.values(req.body)
        reqArray.length = reqParamCount
        reqArray[reqArray.length - 1] = id

        // console.log(put_req_queries[i], reqArray)

        const query = await pool.query(put_req_queries[i], reqArray)

        res.json("Insumo atualizado.")
    } catch (err) {
        console.error(err.message);
    }

})


// deletar insumo
app.delete(spec_paths, async (req, res) => {
    try {
        match = req.path.split('/')[1]
        i = paths.indexOf('/' + match)  // identificar rota para determinar request
        const id = req.path.split('/')[req.path.split('/').length - 1]; // extrair id

        const query = await pool.query(delete_req_queries[i], [id]);

        res.json("Insumo deletado.")
    } catch (err) {
        console.error(err.message);
    }
})

app.listen(3000, () => {
    console.log("server has started on port 3000")
});

