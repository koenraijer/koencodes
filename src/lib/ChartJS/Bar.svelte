<div class="chart">
    <canvas id="myChart" width="500px" height="500px" bind:this={ctx}></canvas>
</div>


<script>
    import Chart from 'chart.js/auto/auto.js';
import { index } from 'd3-array';
    import {afterUpdate} from 'svelte';
import { xlink_attr } from 'svelte/internal';

    // <Chart {data}{backgroundColor}{labels} />

    export let barData;
    export let colors;
    export let barLabels;
    export let barInfo;

    let myChart;
    let ctx;
    
    // Lighten/darken color
    const newShade = (hexColor, magnitude) => {
    hexColor = hexColor.replace(`#`, ``);
    if (hexColor.length === 6) {
        const decimalColor = parseInt(hexColor, 16);
        let r = (decimalColor >> 16) + magnitude;
        r > 255 && (r = 255);
        r < 0 && (r = 0);
        let g = (decimalColor & 0x0000ff) + magnitude;
        g > 255 && (g = 255);
        g < 0 && (g = 0);
        let b = ((decimalColor >> 8) & 0x00ff) + magnitude;
        b > 255 && (b = 255);
        b < 0 && (b = 0);
        return `#${(g | (b << 8) | (r << 16)).toString(16)}`;
    } else {
        return hexColor.split(5);
    }
};

    afterUpdate(
        () => {
            if (myChart) myChart.destroy()
            myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: barLabels,
                    datasets: [{
                        label: '',
                        data: barData,
                        backgroundColor: colors,
                        borderWidth: 0,
                        borderRadius: 5,
                        fill: true
                    }]
                },
                // For styling anything outside of the dataset (so grids etc.)
                options: {
                    indexAxis: 'y',
                    layout: {
                        padding: 1,
                    },
                    responsive: true,
                    aspectRatio: 2,
                    scales: {
                        y: {
                            title: {
                                display: false,
                            },
                            beginAtZero: true,
                            ticks: {
                                font: {size: 16},
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: "Age in years",
                                font: {size: 16},
                            },
                            grid: {
                                display: false,
                            },
                            ticks: {
                                font: {size: 16},
                            }
                        },
   
                    },
                    plugins: {
                        interaction: {
                            mode: index,
                        },
                        tooltip: {
                            events: ['mouseout', 'click', 'touchmove'],
                            position: 'nearest',
                            enabled: true,
                            displayColors: false,
                            callbacks: {
                                afterTitle: function(context) {
                                return `${barInfo[context[0].dataIndex]}`;
                                },
                                label: function(tooltipItem, data) {
                                var value = myChart.data.datasets[tooltipItem.datasetIndex].data[tooltipItem.dataIndex];
                                return `${value} years of age`;
                                },
                            },    
                            titleFont: {
                                size: 13,
                                weight: 'normal',
                            }
                        },
                        title: {
                            font: {size: 25},
                            display: false,
                            text: "Oldest living state leaders",
                        },
                        legend: {
                            display: false,
                        },
                    }
                }
            });
        } 
    );
    
</script>

<style>
    :global(.tooltipDesign) {
        background: hsla(176, 100%, 5%, 0.7);
        border-radius: var(--corner-unit);
        color: var(--primary-500);
        opacity: 1;
        pointer-events: none;
        position: absolute;
        font-size: 0.65em;
        transform: translate(-50%, -25%);
        transition: 0.2s ease;
        padding: 0.35rem;
        box-shadow: var(--shadow-elevation-low);
    }

    :global(.tooltipUl) {
        margin: 0;
        padding: 0;
        list-style: none;
        text-align: center;
        font-weight: bold;
    }
    
    :global(.colorSquare) {
        width: 1rem;
        height: 1rem;
        display: inline-block;
    }
</style>