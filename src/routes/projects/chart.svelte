<script>
    import Chart from '$lib/Chart.svelte'

    let labels = ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'];
    let data = [0, 1, 2, 3, 4, 5];

</script>

<div class="container">
    <input type="number" bind:value={data[0]}>
    <input type="number" bind:value={data[1]}>
    <input type="number" bind:value={data[2]}>
    <input type="number" bind:value={data[3]}>
    <input type="number" bind:value={data[4]}>
    <input type="number" bind:value={data[5]}>
    
    <Chart {data}{labels}/>
</div>
