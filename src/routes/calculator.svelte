<script>
    //------------- CALCULATOR ------------- //
    let volatileAssets = null;
    let stableAssets = null;
    let desiredPercVolatile = 0;

    $: totalPortfValue = volatileAssets + stableAssets;
    $: actPercVolatile = (volatileAssets / totalPortfValue) * 100;
    $: actPercStable = Math.round(actPercVolatile);
    $: diffActAndDesVolatile = volatileAssets - ((desiredPercVolatile / 100) * totalPortfValue)

    //--------------- DATA -------------------//
    const calculatorData = [
        { name: "Volatile", value: volatileAssets },
        { name: "Stable", value: stableAssets },
    ];

    $: calculatorData[0].value = volatileAssets;
    $: calculatorData[1].value = stableAssets;  
</script>

<main>
    <h1>Portfolio rebalancing calculator</h1>
    <!--------------- FORM ----------------->
    <form name="calculator">
        <input type="hidden" name="form-name" value="contact">
        <ol>
            <li>
                <label for="field-volatile">Current money in volatile assets?</label>
                <input type="number" min=0 bind:value={volatileAssets} name="volatile" id="field-volatile" required="" aria-required="true" placeholder="Enter value of volatile assets" autocomplete="volatile" autocorrect="off" autocapitalize="off" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
            </li>
            <li>
                <label for="field-stable">Current money in stable assets?</label>
                <input type="number" min=0 bind:value={stableAssets} name="stable" id="field-stable" required="" aria-required="true" placeholder="Enter value of stable assets" autocomplete="stable" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
            </li>
            <li>
                <label for="field-percentage">Preferred percentage of volatile assets?</label>
                <input type="range" bind:value={desiredPercVolatile} min=0 max=100 name="percentage" id="field-percentage" required="" aria-required="true" autocapitalize="off" class="">
                <label>{desiredPercVolatile}%</label>
        </ol>
    </form>

    <div class="explanation">
        <!---------------POST RESULT-------------------->
        <div class="explanation-text">
            <h3>You currently have <span>
            {#if !volatileAssets}
                {#if stableAssets}
                    0%
                {:else if !stableAssets}
                    0%
                {/if}
            {:else if !stableAssets}
                {#if volatileAssets}
                    100%
                {/if}
            {:else}{Math.round(actPercVolatile)}%{/if}</span> of your total portfolio value of <span>€{totalPortfValue}</span> in stocks.<br> To rebalance, 
            {#if diffActAndDesVolatile > 0}sell{:else}buy{/if}
            <span>€{Math.abs(Math.round(diffActAndDesVolatile))}</span> of volatile assets. </h3>
        </div>
        <!---------------PIE CHART---------------------->
        <div class="explanation-pie">
            <svg height="20" width="20" viewBox="0 0 20 20">
                <circle class="circle" r="10" cx="10" cy="10" fill="#111344"/>
                <circle r="5" 
                        cx="10" 
                        cy="10" 
                        fill="transparent" 
                        stroke="#06D6A0"
                        stroke-width = "10"
                        stroke-dasharray="calc({Math.round(actPercVolatile)} * 30.65 / 100) 31.4159"
                        transform="rotate(-90) translate(-20)"
                />
                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="3">{#if !actPercVolatile}{:else}{Math.round(actPercVolatile)}{/if}</text>
            </svg>
        </div>
    </div>

    <hr>
    <p>This calculator is intended for people who follow a long-term investment strategy such as the <a href="https://www.bogleheads.org/wiki/Bogleheads®_investment_philosophy">Boglehead method</a>, where there's a volatile part and a stable part: stocks and bonds.</p>
    <p>In recent years, low interest rates have made bonds unattractive. People now opt for deposit savings or cash buffers. Stocks are still in high demand, but crypto currencies are gaining ground.</p> 
    <p>None of this is relevant for this calculator, as long as there is a volatile and a stable asset that you're trying to balance!</p>

</main>

<style lang="scss">
    .explanation {
        display: grid;
        padding: 1rem 0 1rem;
        grid-template-columns: 1fr;
        @media screen and (min-width: 600px) {
            grid-template-columns: 1fr 1fr;
        }
    }

    .explanation-pie {
        @media screen and (min-width: 600px) {
            padding: 0;
        }
        padding: 1rem 0 0;
        justify-self: center;
    }
    
    h3 {
        font-weight: normal;
        margin: 0;

    }
    svg {
        width: 10rem;
        height: 10rem;
        text {
            font-weight: bold;
            fill: white;
        }
    }

    :global(.dark) {
        .circle {
            fill: #6E71DB;
        }
    }
    

    a {
        color: #06D6A0;
        text-decoration: none;
        &:hover{
            text-decoration: underline;
        }
    }

    ol {
        list-style: none;
        margin: 0;
        padding: 0;
        li {
            display: grid;
            grid-template-columns: 1fr;
            grid-gap: 0.25rem;
            padding-bottom: 1rem;
        }
    }

    span {
        color: #06D6A0;
        font-weight: bold;
    }

    #orange {
        color: #FEA82F;
    }

    form {
        border: #111344 2px solid;
        box-shadow: 0 0 5px #111344;
        padding: 0.5rem;
    }

    input[type="number"] {
        font-size: inherit;
        box-shadow: none;
        appearance: none;
        -moz-appearance: none;
        -webkit-appearance: none;
        outline: 1px black solid;
        padding: 0.25rem;
        margin: 0 0.25rem 0;
        width: auto;
    }

    label {
        padding-left: 0.25rem;
    }

    ::-moz-focus-inner {
    border: 0;
    padding: 0;
    }
    
    input[type="range"] {
    -webkit-appearance: none;
    width: auto;
    margin: 0.25rem 0 0.25rem;
    padding: 0 0.25rem 0;
    }

    input[type="range"]::-webkit-slider-runnable-track {
    background: #111344;
    height: 5px;
    }

    input[type="range"]::-moz-range-track {
    background: #111344;
    height: 5px;
    }

    input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 20px;
    width: 20px;
    background: #06D6A0;
    margin-top: -7.5px;
    border-radius: 50%;
    @media screen and (min-width: 600px) {
        height: 15px;
        width: 15px;
        margin-top: -5px;
    }
    }

    input[type="range"]::-moz-range-thumb {
    height: 20px;
    width: 20px;
    background: #06D6A0;
    margin-top: -5px;
    border-radius: 50%;
    @media screen and (min-width: 600px) {
        height: 15px;
        width: 15px;
        margin-top: -5px;
    }
    }

    :global(.dark) {
        input[type="range"]::-webkit-slider-runnable-track {
        background: white;
        height: 5px;
        }

        input[type="range"]::-moz-range-track {
        background: white;
        height: 5px;
        }

        form {
            box-shadow: 0 0 5px white;
            border: white 2px solid;
        }
    }
</style>

<!--
    <svg>
        {#each calculatorData as data, i}
            <rect x={i * 20} height={data.value / 100} width="10" fill="#06D6A0" />
        {/each}
    </svg>


    {#each calculatorData as data}
    <p>{data.name}: {data.value}</p>
    {/each}\

-->