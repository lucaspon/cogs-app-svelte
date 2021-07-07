<script>
  import Router from "svelte-spa-router";
  import Navbar from "./Components/Navbar.svelte";
 // Routes ------------------------------
  import Home from "./Routes/Home.svelte";
  import Insumos from "./Routes/Insumos.svelte";
  import Produtos from "./Routes/Produtos.svelte";
  import Compras from "./Routes/Compras.svelte";
  import Lotes from "./Routes/Lotes.svelte";
  import Vendas from "./Routes/Vendas.svelte";
  import EstoquesInsumos from "./Routes/EstoquesInsumos.svelte";
  import EstoquesProdutos from "./Routes/EstoquesProdutos.svelte";
</script>

<Navbar/>

<Router
  routes={{
    '/': Home,
	'/insumos': Insumos,
	'/produtos': Produtos,
	'/compras': Compras,
	'/lotes': Lotes,
	'/vendas': Vendas,
	'/estoquesinsumos': EstoquesInsumos,
	'/estoquesprodutos': EstoquesProdutos
  }}
/>
