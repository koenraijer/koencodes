<canvas id="myChart" width="500px" height="500px" bind:this={ctx}></canvas>


<script>
    import Chart from 'chart.js/auto/auto.js';
    import {afterUpdate} from 'svelte';

    // Copy this to use: 
    // <Chart {data}{backgroundColor}{labels} />

    export let data;
    export let colors;
    export let labels;

    let myChart;
    let ctx;

    afterUpdate(
        () => {
            if (myChart) myChart.destroy()
            myChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels,
                    datasets: [{
                        label: '# of Votes',
                        data,
                        backgroundColor: colors,
                        borderColor: colors,
                        borderWidth: 1,
                    }]
                },
                // For styling anything outside of the dataset (so grids etc.)
                options: {
                    scales: {
                        x: {display: false},
                        y: {display: false}
                    }
                }
            });
        } 
    );
    
    
</script>
