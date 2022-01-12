<canvas id="myChart" width="500px" height="500px" bind:this={ctx}></canvas>
<div id="chartjs-tooltip"></div>

<script>
    import Chart from 'chart.js/auto/auto.js';
    import {afterUpdate} from 'svelte';

    // <Chart {data}{backgroundColor}{labels} />

    export let lineData;
    export let colors;
    export let lineLabels;
    let barInfo = ["Queen of the United Kingdom and other Commonwealth realms", "President of Cameroon", "President of Lebanon", "President of the Palestinian National Authority, President of the State of Palestine", "King of Saudi Arabia, Prime Minister of Saudi Arabia", "Pope of the Holy See, Sovereign of the Vatican City State", "King of Norway", "Governor-General of the Bahamas"];

    let myChart;
    let ctx;

    afterUpdate(
        () => {
            if (myChart) myChart.destroy()
            myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: lineLabels,
                    datasets: [{
                        label: '',
                        data: lineData,
                        borderColor: colors,
                        borderWidth: 1,
                        fill: false
                    }]
                },
                // For styling anything outside of the dataset (so grids etc.)
                options: {
                  animation,
                    layout: {
                        padding: 1,
                    },
                    responsive: true,
                    aspectRatio: 2,
                    tension: 0.5,
                    scales: {
                        y: {
                            beginAtZero: true,
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: "Apple gross profit",
                        },
                        subtitle: {
                            display: true,
                            text: 'from 2005 up to and including 2021',
                            padding: 10,
                        },
                        legend: {
                            display: false,
                        },
                        tooltip: {
                          displayColors: false,
                          callbacks: {
                            /*label: function(tooltipItem, data) {
                              var label = myChart.data.labels[tooltipItem.dataIndex];
                              var value = myChart.data.datasets[tooltipItem.datasetIndex].data[tooltipItem.dataIndex];
                              return label + ': ' + value + ' million USD';
                            },*/
                            label: function(tooltipItem, data) {
                              var value = myChart.data.datasets[tooltipItem.datasetIndex].data[tooltipItem.dataIndex];
                              return value + ' million USD';
                            },
                          }
                        }
                    }
                }
            });
        } 
    );
    
const totalDuration = 2000;
const delayBetweenPoints = totalDuration / lineData.length;
const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y;
const animation = {
  x: {
    type: 'number',
    easing: 'linear',
    duration: delayBetweenPoints,
    from: NaN, // the point is initially skipped
    delay(ctx) {
      if (ctx.type !== 'data' || ctx.xStarted) {
        return 0;
      }
      ctx.xStarted = true;
      return ctx.index * delayBetweenPoints;
    }
  },
  y: {
    type: 'number',
    easing: 'linear',
    duration: delayBetweenPoints,
    from: previousY,
    delay(ctx) {
      if (ctx.type !== 'data' || ctx.yStarted) {
        return 0;
      }
      ctx.yStarted = true;
      return ctx.index * delayBetweenPoints;
    }
  }
};
</script>
