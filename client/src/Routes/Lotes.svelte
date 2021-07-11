<script>
  import Datatable from "../Components/Datatable.svelte";
</script>

<div class="container mt-3">
  <div class="row">
    <div class="col text-center">
      <h1>Lotes de Produção</h1>

      <Datatable page={"lotes"} />

    </div>
  </div>
  <div class="row">
      <div class="col text-center">
        <h1>Fichas Técnicas (Bill of Materials)</h1>
        <h2>Para cada lote, cadastre o consumo de insumos de cada produto:</h2>
  
        <Datatable page={"lotes_bom"} />
      </div>
  </div>
</div>
