<script>
    $: start = false;
    $: tsh = null;
    $: tsh1t4 = null;
    $: bevallen = null;
    $: iatrogeen = null;
    $: tsh0t4 = null;
    $: ziek = null;
    $: bse = null;
    $: tshr = null;
    $: amiolith = null;
    $: bevallen2 = null;
    $: struma = null;
    $: nodus = null;
    $: solnodus = null;

    let flowchartProps = {
        start : start,
        tsh : tsh,
        tsh1t4 : tsh1t4,
        bevallen : bevallen,
        iatrogeen : iatrogeen,
        tsh0t4 : tsh0t4,
        ziek : ziek,
        bse : bse,
        tshr : tshr,
        amiolith : amiolith,
        bevallen2 : bevallen2,
        struma : struma,
        nodus : nodus,
        solnodus : solnodus,
    }

</script>
<h1>Diagnostiek bij vermoeden van een schildklierfunctiestoornis</h1>
<p><i>This interactive flowchart is adapted from the <a href="https://richtlijnen.nhg.org/standaarden/schildklieraandoeningen#samenvatting-richtlijnen-beleid-bij-hyperthyreodie">NHG-Standaard Schildklieraandoeningen</a>, and specifically from <a href="https://richtlijnen.nhg.org/files/2021-06/M31_juli_2013_2.png">this flowchart</a>. I might have made mistakes so plz don't use it.</i></p>
<p style="padding-bottom: 0.5rem;">Dit interactieve stroomdiagram is een aanpassing van de <a href="https://richtlijnen.nhg.org/standaarden/schildklieraandoeningen#samenvatting-richtlijnen-beleid-bij-hyperthyreodie">NHG-Standaard Schildklieraandoeningen</a>, en specifiek van <a href="https://richtlijnen.nhg.org/files/2021-06/M31_juli_2013_2.png">dit stroomdiagram</a>. Er kunnen zeker nog fouten in zitten!</p>

<button on:click={() => (start = true)}>Start beslisboom</button>
{#if start }
    <p>Is het TSH verhoogd, verlaagd of normaal?</p>
    <button on:click={() => (tsh = 1)}>Verhoogd</button>
    <button on:click={() => (tsh = 2)}>Verlaagd</button>
    <button on:click={() => (tsh = 3)}>Normaal</button>
    <!--EMPHASIZE THE CHOICE CURRENTLY ACTIVE-->
{/if}
{#if tsh }
    {#if tsh === 3}
        <p>Euthyreoïdie</p>
    {:else if tsh === 1}
        <p>Is het Vrije T4 verhoogd, verlaagd of normaal?</p>
        <button on:click={() => (tsh1t4 = 1)}>Verhoogd</button>
        <button on:click={() => (tsh1t4 = 2)}>Verlaagd</button>
        <button on:click={() => (tsh1t4 = 3)}>Normaal</button>
        {#if tsh1t4 === 3}
            <p>Subklinische hypothyreoïdie</p>
        {:else if tsh1t4 === 1}
            <ul>
                <li>TSH-producerend adenoom van de hypofyse</li>
                <li>Perifere resistentie schildklierhormoon (<i>zeldzaam</i>)</li>
            </ul>
        {:else if tsh1t4 === 2}
            <p>Minder dan 1 jaar geleden bevallen?</p>
            <button on:click={() => (bevallen = 2)}>Nee</button>
            <button on:click={() => (bevallen = 1)}>Ja</button>

            {#if bevallen === 1}
                <p>Post-partum thyreoïditis</p>
            {:else if bevallen === 2}
                <p>Schildklieroperatie, bestraling van de hals, of medicatiegebruik?</p>
                <button on:click={() => (iatrogeen = 2)}>Nee</button>
                <button on:click={() => (iatrogeen = 1)}>Ja</button>
                {#if iatrogeen === 1}
                    <p>Iatrogene hypothyreoïdie</p>
                {:else if iatrogeen === 2}
                    <ul>
                        <li>Thyreoïditis van Hashimoto</li>
                        <li>Stille lymfocytaire thyreoïditis</li>
                    </ul>
                {/if}
            {/if}
        {/if}
    {:else if tsh === 2}
        <p>Is het Vrije T4 verhoogd, verlaagd of normaal?</p>
        <button on:click={() => (tsh0t4 = 1)}>Verhoogd</button>
        <button on:click={() => (tsh0t4 = 2)}>Verlaagd</button>
        <button on:click={() => (tsh0t4 = 3)}>Normaal</button>
        {#if tsh0t4 === 3}
            <p>Subklinische hyperthyreoïdie</p>
        {:else if tsh0t4 === 1}
            <p>Hyperthyreoïdie</p>
            <p>Pijnlijke schildklier, koorts, koude rillingen en malaise?</p>
            <button on:click={() => (ziek = 2)}>Nee</button>
            <button on:click={() => (ziek = 1)}>Ja</button>
            {#if ziek === 2}
                x (TSH-R)
            {:else if ziek === 1} 
                <p>Verhoogde BSE, leucocytose?</p>
                <button on:click={() => (bse = 2)}>Nee</button>
                <button on:click={() => (bse = 1)}>Ja</button>
                {#if bse === 1}
                    <p>Sucacute thyreoïditis</p>
                {:else if bse === 2}
                    <p>Anti-TSH-R antistoffen?</p>
                    <button on:click={() => (tshr = 2)}>Nee</button>
                    <button on:click={() => (tshr = 1)}>Ja</button>
                    {#if tshr === 1}
                        <p>Ziekte van Graves</p>
                    {:else if tshr === 2}
                        <p>Amiodaron of lithiumgebruik?</p>
                        <button on:click={() => (amiolith = 2)}>Nee</button>
                        <button on:click={() => (amiolith = 1)}>Ja</button>
                        {#if amiolith === 1}
                            <p>Iatrogene hyperthyreoïdie</p>
                        {:else if amiolith === 2}
                            <p>Minder dan 1 jaar geleden bevallen?</p>
                            <button on:click={() => (bevallen2 = 2)}>Nee</button>
                            <button on:click={() => (bevallen2 = 1)}>Ja</button>
                            {#if bevallen2 === 1}
                                <p>Post-partum thyreoïditis</p>
                            {:else if bevallen2 === 2}
                                <p>Is er sprake van struma?</p>
                                <button on:click={() => (struma = 2)}>Nee</button>
                                <button on:click={() => (struma = 1)}>Ja</button>
                                {#if struma === 1}
                                    <p>Is er een dominante nodus?</p>
                                    <button on:click={() => (nodus = 2)}>Nee</button>
                                    <button on:click={() => (nodus = 1)}>Ja</button>
                                    {#if nodus === 1}
                                        <p>Multinodulair struma</p>
                                    {:else if nodus === 2}
                                        <p>Multinodulair struma met dominante nodus</p>
                                    {/if}
                                {:else if struma === 2}
                                    <p>Is er een solitaire nodus?</p>
                                    <button on:click={() => (solnodus = 2)}>Nee</button>
                                    <button on:click={() => (solnodus = 1)}>Ja</button>
                                    {#if solnodus === 2}
                                        <p>Stille lymfocytaire thyreoïditis</p>
                                    {:else if solnodus === 1}
                                        <p>Toxisch adenoom</p>
                                    {/if}
                                {/if}
                            {/if}
                        {/if}
                    {/if}
                {/if}
            {/if}
        {:else if tsh0t4 === 2}
            <p>Secundaire of tertiaire hypothyreoïdie (<i>zeldzaam</i>)</p>
        {/if}
    {/if}
{/if}

<!--CONTROLEER DATA
Patient heeft verhoogd TSH, Verlaagd T4, is niet recent bevallen. Volgens de beslisboom wijst dat in alle waarschijnlijkheid op:
-->
<style lang="scss">
    button {
        font-family: inherit;
        font-size: inherit;
        padding: 0.25rem;
        background: transparent;
        box-shadow: none;
        outline: none;
        border: 2px solid #111344;
        &:hover {
            outline: 2px solid #06D6A0;
            cursor: pointer;
        }
    }
   :global(.dark) {
       button {
           color: white;
           border: 2px solid white;
       }
   }

   a {
        color: #06D6A0;
        text-decoration: none;
        &:hover{
            text-decoration: underline;
        }
   }
</style>