<script>
    let volatileAssets = null;
    let stableAssets = null;
    let desiredPercVolatile = 0;

    $: totalPortfValue = volatileAssets + stableAssets;
    $: actPercVolatile = (volatileAssets / totalPortfValue) * 100;
    $: diffActAndDesVolatile = volatileAssets - ((desiredPercVolatile / 100) * totalPortfValue)
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
                <input type="range" bind:value={desiredPercVolatile} min=0 max=100 name="percentage" id="field-percentage" required="" aria-required="true" autocapitalize="off" class="">{desiredPercVolatile}%
        </ol>
    </form>

    <!---------------POST RESULT-->
    <h3 style="font-weight: normal; padding-bottom: 0.5rem;">You currently have <span>
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
        {:else}{Math.round(actPercVolatile)}%{/if}</span> of your total portfolio value of <span>€{totalPortfValue}</span> in stocks. To rebalance, 
        {#if diffActAndDesVolatile > 0}sell{:else}buy{/if}
        <span>€{Math.abs(Math.round(diffActAndDesVolatile))}</span> of volatile assets.</h3>
        
        <hr>
        <p>This calculator is intended for people who follow a long-term investment strategy such as the <a href="https://www.bogleheads.org/wiki/Bogleheads®_investment_philosophy">Boglehead method</a>, where there's a volatile part and a stable part: stocks and bonds.</p>
    <p>In recent years, low interest rates have made bonds unattractive. People now opt for deposit savings or cash buffers. Stocks are still in high demand, but crypto currencies are gaining ground.</p> 
    <p>None of this is relevant for this calculator, as long as there is a volatile and a stable asset that you're trying to balance!</p>

</main>

<style lang="scss">

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

    form {
        border: #111344 2px solid;
        box-shadow: 0 0 5px #111344;
        padding: 0.5rem;
    }

    input {
        font-size: inherit;
    }

    input[type="range"] {
    -webkit-appearance: none;
    }

    input:focus {
    outline: none;
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
    height: 15px;
    width: 15px;
    background: #06D6A0;
    margin-top: -5px;
    border-radius: 50%;
    }

    input[type="range"]::-moz-range-thumb {
    height: 15px;
    width: 15px;
    background: #06D6A0;
    margin-top: -5px;
    border-radius: 50%;
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
    }
</style>