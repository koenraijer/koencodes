<script>
    // Common part and "move" method
    let volatileAssets = null;
    let stableAssets = null;
    let desiredPercVolatile = 0;
    let method = 1; // 1 equals buy, 2 equals move. 

    $: totalPortfValue = volatileAssets + stableAssets;
    $: actPercVolatile = (volatileAssets / totalPortfValue) * 100;
    $: actPercStable = Math.round(actPercVolatile);
    $: diffActAndDesVolatile = volatileAssets - ((desiredPercVolatile / 100) * totalPortfValue)

    // "buy" method
    let dX;
    let a;
    $: a = desiredPercVolatile / 100;
    $: dX = ((a * volatileAssets - volatileAssets) + (a * stableAssets)) / (1 - a);

    //----------------CHARTJS------------------//
    $: data[0] = volatileAssets;
    $: data[1] = stableAssets;

    import Chart from "$lib/ChartJS/Pie.svelte"
    let labels = ["Volatile", "Stable"]
    let data = [5, 4];
    let colors = ["#53c6be", "#ff5100"]

    // Autofocus
    import {browser} from '$app/env';

    let fieldVolatile;
    if (browser) {
        window.onload = function() {
        document.getElementById("field-volatile").focus();
        };
    }


    //---------------SEO ----------------------//
    import Seo from '$lib/Seo.svelte'

    let pageTitle = "portfolio rebalancing calculator"
    let metaDescription = "An interactive calculator meant to rebalance an investing portfolio consisting of volatile assets such as stocks, and stable assets such as bonds."

</script>
<Seo {pageTitle}{metaDescription}/> 


<main class="container">
    <h1>Portfolio rebalancing calculator</h1>
    <div class="grid">
        <div class="wrapper">
            <form name="calculator">
                <input type="hidden" name="form-name" value="contact">
                <ol>
                    <li>
                        <label for="field-volatile">Volatile assets (e.g. stocks)</label>
                        <input type="text" inputmode="numeric" class="numeric" min=0 bind:value={volatileAssets} name="volatile" id="field-volatile" required="" aria-required="true" autocomplete="volatile" autocorrect="off" autocapitalize="off" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                    </li>
                    <li>
                        <label for="field-stable">Stable assets? (e.g. bonds)</label>
                        <input type="text" inputmode="numeric" class="numeric" min=0 bind:value={stableAssets} name="stable" id="field-stable" required="" aria-required="true" autocomplete="stable" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                    </li>
                    <li>
                        <label for="field-percentage">Desired percentage of volatile assets?</label>
                        <label id="desiredPerc">{desiredPercVolatile}%</label>
                        <input type="range" bind:value={desiredPercVolatile} min=0 max=100 name="percentage" id="field-percentage" required="" aria-required="true" autocapitalize="off" class="">
                    </li>
                    <li>
                        <label>Buy new assets or relocate already owned assets to achieve desired percentage?</label><br>
                        <input type="radio" id="buy" name="method" bind:group={method} value={1}>
                        <label for="buy">Buy</label>
                        <input type="radio" id="move" name="method" bind:group={method} value={2}>
                        <label for="move">Move</label>
                    </li>
                </ol>
            </form>
        </div>

        <div class="wrapper">
            <div class="explanation-text">
                {#if method === 2} <!-- if method is move-->
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
                    {:else}{Math.round(actPercVolatile)}%{/if}</span> of your total portfolio value of <span>€{totalPortfValue}</span> in volatile assets.<br> To rebalance, 
                    move <span>€{Math.abs(Math.round(diffActAndDesVolatile))}</span> {#if diffActAndDesVolatile > 0}from{:else}to{/if} volatile assets. </h3>
                {:else} <!-- if method is buy-->
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
                        {:else}{Math.round(actPercVolatile)}%{/if}</span> of your total portfolio value of <span>€{totalPortfValue}</span> in volatile assets. To rebalance,
                        {#if dX > 0}buy{:else}sell{/if} <span>€{Math.abs(Math.round(dX))}</span> of volatile assets.
                        </h3>
                {/if}
            </div>

            <div class="explanation-pie">
                <Chart {data} {labels}{colors}/>
            </div>
        </div>

        <div style="margin-top: var(--spacing-unit);" class="disclaimer">
            <hr>
            <p>This calculator is intended for people who follow a long-term investment strategy such as the <a target="_blank" rel="noopener" href="https://www.bogleheads.org/wiki/Bogleheads®_investment_philosophy">Boglehead method</a>, where there's a volatile part and a stable part: stocks and bonds.</p>
            <p>In recent years, low interest rates have made bonds unattractive. People now opt for deposit savings or cash buffers. Stocks are still in high demand, but crypto currencies are gaining ground.</p> 
            <p>None of this is relevant for this calculator, as long as there is a volatile and a stable asset that you're trying to balance!</p>
        </div>
    </div>
    
</main>

<style lang="scss">

    .container {
        max-width: 70ch;
    }

    .wrapper {
        display: grid;
        align-items: center;
        justify-items: center;
        grid-gap: var(--spacing-unit);
        margin: var(--spacing-unit);
    }

    .explanation-pie {
        @media screen and (min-width: 600px) {
            padding: 0;
        }
        padding: var(--spacing-unit) 0 0;
        justify-self: center;
        width: 10rem;
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
    
    a {
        color: var(--primary-300);
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
            padding-bottom: 1.5rem;
            &:last-child {
                display: block;
            }
        }
    }

    span {
        color: var(--primary-300);
        font-weight: bold;
    }

    form {
        box-shadow: var(--shadow-elevation-mediumhigh);
        padding: var(--spacing-unit);
        max-width: 25rem;
    }

    .numeric {
        font-size: inherit;
        box-shadow: none;
        border-style: none;
        border-radius: calc(var(--corner-unit) * 0.5);
        appearance: none;
        -moz-appearance: none;
        -webkit-appearance: none;
        box-shadow: var(--shadow-elevation-mediumhigh);
        padding: 0.25rem;
        margin: 0;
        max-width: 50%;
        &:-webkit-outer-spin-button,
        &:-webkit-inner-spin-button {
        -webkit-appearance: none;
        }
        -moz-appearance: textfield;
        &:focus {
            box-shadow: var(--shadow-elevation-high);
            outline: none;
        }
    }

    label {
        text-align: left;
    }

    #desiredPerc {
        color: var(--gray-300);
        font-size: 0.9em;
    }

    ::-moz-focus-inner {
    border: 0;
    padding: 0;
    }
    
    input[type="range"] {
    -webkit-appearance: none;
    width: auto;
    margin: 0.25rem 0 0.25rem;
    padding: 0;
    }

    input[type="range"]::-webkit-slider-runnable-track {
    background: var(--gray-400);
    border-radius: 10px;
    height: 6px;
    max-width: 75%;
    }

    input[type="range"]::-moz-range-track {
    background: var(--gray-400);
    border-radius: 10px;
    max-width: 75%;
    height: 6px;
    }

    input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 20px;
    width: 20px;
    box-shadow: var(--shadow-elevation-medium);
    background: var(--primary-200);
    margin-top: -7.5px;
    border-radius: 50%;

    }

    input[type="range"]::-moz-range-thumb {
    height: 20px;
    width: 20px;
    background: var(--primary-300);
    margin-top: -5px;
    border-radius: 50%;

    }

    input[type="radio"] {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        border-radius: 50%;
        width: 20px;
        height: 20px;

        transition: 0.2s all linear;
        position: relative;
        top: 0.1rem;
        box-shadow: var(--shadow-elevation-medium);
        &:checked {
            background: var(--primary-200);
        }
    }

    .container {
        h1 {
            margin: calc(var(--spacing-unit) * 3) 0 calc(var(--spacing-unit) * 1);
            text-align: center;
        }
    }

    .form-wrapper {
        display: grid;
        align-items: start;
        text-align: left;
        justify-items: start;
    }
</style>

<!--FORMULA CALCULATION FOR 2 FUNDS
    X1 = 50 (oud)
    Y = 50 (ander fonds)
    a = 0,7 (gewenste fractie X)
    X2 = (nieuw)

    X2 = 0.7 * (X2 + Y)
    X2 = dX + X1
    dX + X1 = 0.7 * ((dX + X1) + Y)
    dX + X1 = 0.7dX + 0.7X1 + 0.7Y
    dX = 0.7dX - 0.3X1 + 0.7Y
    0.3dX = 0.7Y - 0.3X1
    dX = (1/0.3) * (0.7Y - 0.3X1)
    dX = 2,33Y - X1
    dX = 66,5

    dX + X1 = a * ((dX + X1) + Y)
    dX + X1 = a*dX + a*X1 + a*Y
    dX = a*dX + (a*X1 - X1) + a*Y
    dx - a*dX = (a*X1 - X1) + a*Y 
    (1 - a) * dX = (a*X1 - X1) + a*Y 
    dX = ((a*X1 - X1) + a*Y) / (1 - a) 

    TEST:
    dX = ((0,7 * 50 - 50) + 0,7*50) / (1 - 0,7)
    dX = 66,5

    SO:
    dX = ((a*X1 - X1) + a*Y) / (1 - a) 
    
    TRANSLATION TO CODE
    
-->