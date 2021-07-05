<script>
  import Router from "svelte-spa-router";
  import Datagrid from "./Datagrid.svelte";
</script>

<nav>
	<a href="/#/">Home</a>
	<a href="/#/insumos">Insumos</a>
	<a href="/#/produtos">Produtos</a>
	<a href="/#/compras">Compras</a>
	<a href="/#/lotes">Lotes</a>
	<a href="/#/vendas">Vendas</a>
	<a href="/#/estoques">Estoques</a>
</nav>

<Router
  routes={{
    '/': Home,
	'/insumos': Insumos,
	'/produtos': Produtos,
	'/compras': Compras,
	'/lotes': Lotes,
	'/vendas': Vendas,
	'/estoques': Estoques
  }}
/>
