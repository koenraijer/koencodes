<script>
    import Chart from '$lib/Chart.svelte'

    let labels = ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'];
    let colors = ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'];
    let data = [0, 1, 2, 3, 4, 5];

    /*---------------------------*/
    import {line} from "d3-shape"
</script>

<div class="container">
    <div>
        <input type="number" bind:value={data[0]}>
        <input type="number" bind:value={data[1]}>
        <input type="number" bind:value={data[2]}>
        <input type="number" bind:value={data[3]}>
        <input type="number" bind:value={data[4]}>
        <input type="number" bind:value={data[5]}>
        
        <Chart {data}{labels}{colors}/>

    </div>
    <hr>

</div>

<style lang="scss">
    .container {
      max-width: 1300px;
      @media screen and (max-width: 600px) {
          max-width: 100vw;
      }
      margin: 1rem auto;
      position: relative;
      div {
          margin: 1rem;
      }
    }
    
</style>
