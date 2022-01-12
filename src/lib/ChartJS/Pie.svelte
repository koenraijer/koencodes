<canvas id="myChart" bind:this={ctx}></canvas>


<script>
    import Chart from 'chart.js/auto/auto.js';
    import {afterUpdate} from 'svelte';

    // <Chart {data}{backgroundColor}{labels} />

    export let data = [0, 1, 2, 3, 4, 5];
    export const colors = ["#ff5100","#00bdb0","#993000", "#00ffee", "#949e9d", "#bfd9d7", "#abede9", "#FFA076", "#6f7b7a", "gray"];
    export let labels = ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'];

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
                    responsive: true,
                    scales: {
                        x: {display: false},
                        y: {display: false}
                    }
                }
            });
        } 
    );
    
</script>
