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
  let getPath = "http://localhost:3000/" + page;

  async function getData(path) {
    let response = await fetch(path, { method: "GET" });
    let data = await response.json();
    console.log(data);

    let cols = Object.getOwnPropertyNames(data[0]); //extract columns

    console.log(cols);
    return [cols, data];
  }

  let data = getData(getPath);
  let cols = data[0];
  let rows = data[1];


</script>

{#await cols}
  <p>...carregando</p>
{:then { cols, rows }}
  {#if cols.length === 0}
    <p>No data</p>
  {:else}
    <table class="table">
      <thead>
        <tr>
          {#each cols as col}
            <th scope="col">{col}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each rows as row}
          <tr>
            {#each values as value}
              <td>{value}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
{:catch error}
  <p>Erro!</p>
{/await}
