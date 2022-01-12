<div class="chart">
    <canvas id="myChart" width="500px" height="500px" bind:this={ctx}></canvas>
</div>


<script>
    import Chart from 'chart.js/auto/auto.js';
import { index } from 'd3-array';
    import {afterUpdate} from 'svelte';

    // <Chart {data}{backgroundColor}{labels} />

    export let barData;
    export let colors;
    export let barLabels;

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

    // custom tooltip block
    const getOrCreateTooltip = (chart) => {
        // Checks if tooltip is there
        let tooltipEl = chart.canvas.parentNode.querySelector('div');
        // If not, add it. 
        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.classList.add('tooltipDesign');
            chart.canvas.parentNode.appendChild(tooltipEl);
        }
        return tooltipEl;
    };

    // trigger
    const externalTooltipHandler =  (context, data) => {
        const {chart, tooltip} = context;
        const tooltipEl = getOrCreateTooltip(chart);
        // Hide if mouseout
        if(tooltip.opacity === 0) {
            tooltipEl.style.opacity = 0; // hide if mouseout.
            return;
        };

        // Tooltip text
        if(tooltip.body) {
            const titleLines = tooltip.title || [];
            const bodyLines = tooltip.body.map(b => b.lines);
            const tooltipLi = document.createElement('li');

            let tooltipUl = document.createElement('UL');
            tooltipUl.classList.add('tooltipUl');
            tooltipEl.appendChild(tooltipUl);
            // 4A title loop
            titleLines.forEach(title => {
                tooltipUl.appendChild(tooltipLi);
                const tooltipSpan = document.createElement('span');
                tooltipLi.appendChild(tooltipSpan);
                const tooltipTitle = document.createTextNode(title);
                tooltipSpan.appendChild(tooltipTitle);
            })

            // 4B body loop
            const tooltipBodyp = document.createElement('p');
            bodyLines.forEach((body, i) => {

                const colors = tooltip.labelColors[i];
                // Convert and darken backgroundColor
                const colorSquare = document.createElement('span');
                colorSquare.classList.add('colorSquare');
                colorSquare.style.background = colors.backgroundColor;
                colorSquare.style.border = colors.borderColor;
                const textLabel = document.createTextNode(body);
                    //const infoLabel = document.createTextNode(barInfo[context[0].dataIndex])
                // apend colorSquare and label
                tooltipBodyp.appendChild(colorSquare);
                tooltipBodyp.appendChild(textLabel);
                    //  tooltipBodyp.appendChild(infoLabel);
                    console.log(context);
            });

            // Add description

            const Ulnode = tooltipEl.querySelector('ul')
            // Remove old children
            while (Ulnode.firstChild) {
                    Ulnode.firstChild.remove();
            }

            // Add new children
            Ulnode.appendChild(tooltipLi);
            tooltipLi.appendChild(tooltipBodyp);
            tooltipEl.style.opacity = 1;

            // Positioning of the tooltip
            const { offsetLeft: positionX, offsetTop: positionY} = chart.canvas;
            tooltipEl.style.left = positionX + tooltip.caretX + 'px';
            tooltipEl.style.top = positionY + tooltip.caretY + 'px';

        }
    }
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
                        fill: true
                    }]
                },
                // For styling anything outside of the dataset (so grids etc.)
                options: {
                    layout: {
                        padding: 1,
                    },
                    responsive: true,
                    aspectRatio: 2,
                    scales: {
                        y: {
    
                            title: {
                                display: true,
                                text: "Age in years",
                            },
                            beginAtZero: false,
                        },
   
                    },
                    plugins: {
                        interaction: {
                            mode: index,
                        },
                        tooltip: {
                            position: 'nearest',
                            enabled: false ,
                            external: externalTooltipHandler, // Const that serves as function
                        },
                        title: {
                            display: true,
                            text: "Oldest living state leaders",
                        },
                        legend: {
                            display: false,
                        }
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