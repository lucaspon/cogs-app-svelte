<script>
  import SvelteTable from "svelte-table";
  import { get } from "svelte/store";
  //   import getData from "../fetcher";

  let sortBy = "id";
  let sortOrder = 1;
  let iconAsc = "↑";
  let iconDesc = "↓";
  let numRows = 10;
  export let page; //props

  const getPath = "http://localhost:3000/" + page;

  async function getData(path) {
    let response = await fetch(path, { method: "GET" });

    let data = await response.json();
    let rows = [];
    data.forEach((element) => rows.push(Object.values(element)));
    console.log(rows);

    var cols = Object.getOwnPropertyNames(data[0]); //extract columns
    console.log(cols);

    return { cols, rows };
  }

  let table = getData(getPath);
</script>

{#await table}
  <p>...carregando</p>
{:then wait}
  {#if wait["cols"].length === 0}
    <p>No data</p>
  {:else}
    <table class="table mt-4">
      <thead>
        <tr>
          {#each wait["cols"] as col}
            <th scope="col">{col}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each wait["rows"] as row}
          <tr>
            {#each row as cell}
              <td>{cell}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
{:catch error}
  <p>Erro!</p>
{/await}

<style>
  table,
  th,
  td {
    border: 1px solid black;
    border-collapse: collapse;
  }
  table {
    background: #eee;
  }
</style>
