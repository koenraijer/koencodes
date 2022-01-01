<script>
    import Chart from '$lib/Chart.svelte'
    import {browser} from '$app/env'
    import {slide} from 'svelte/transition'
    import Checkbox from '$lib/Checkbox.svelte'

    // Init chart params
    let data = [];              // Initial holding amounts
    let labels = [];            // Holding names 
    const colors = ["#ff5100","#00bdb0","#993000", "#00ffee", "#949e9d", "#bfd9d7", "#abede9", "#FFA076", "#6f7b7a"];

    // Init params for inputs/interactivity
    let number;                 // User input for amount
    let name;                   // User input for holding name
    let deposit = 1000;         // User input for amount of upcoming deposit, defaults at 1000 to guide UX. 
    let total;                  // sum of data[]
    let sum;                    // sum of percentages[]

    // Init params for capturing DOM elements
    let userInput;


    // Init params for calculating
    let percentages = []; 
    let targetData = [];

    // Section toggling
    let showContent = [false, true, true, true];
    let checkbox = [];
    
    function toggleNextSection() {
        for (let i = 0; i < checkbox.length; i++) {
            if (checkbox[i].checked == true ) {
                disableInputs();
            } else {
                enableInputs();
            }
        }
       
    }

    // Add const for calculating sum of an array
    const reducer = (previousValue, currentValue) => previousValue + currentValue;

    // FUNCTION DECLARATIONS
    function addFund() {                                            // Is called when user clicks "Add holding"
        try {
            if (typeof number === 'undefined' || number === null)
                throw "Please provide an amount for your asset";
            if (typeof name === 'undefined' || name === null) 
                throw "Please provide a name for your asset.";
            // Add number and name to their respective arrays
            data.push(number);
            labels.push(name);

            // Update the arrays to which something was just added
            data = data;
            labels = labels;
            sum = sum;

            // Update total value
            total = data.reduce(reducer);
        } catch (ex) {
            alert(ex);
        } finally {
            // Reset temporary params
            number = null;
            name = null;
        }
    };

    function addPercentage(index) {                                 // Is called when user adds or changes a percentage for a holding. 
        try {
            // Check if input percentage is between 0 and 100
            if (percentages[index] < 0 || percentages[index] > 100) {
                percentages[index] = 0;
                throw "Please enter a value between 1 and 100";
            }
            // Check if sum of percentages is >100 or <100
            sum = percentages.reduce(reducer);
            if (data.length === percentages.length && data.length !== 0 && sum !== 100) {                
                percentages.splice(index, 1, 0); // Remove faulty value
                sum = percentages.reduce(reducer); 
                let newPerc = 100 - sum;
                percentages.splice(index, 1, newPerc); // Replace faulty value with remainder
                percentages[index] = newPerc;
                if (sum > 100) 
                    throw "You have more than 100%!"
                else if (sum < 100) 
                    throw "You have less than 100%!"
            }

            // Check if percentages[index] is not already there
            if (typeof percentages[index] === 'undefined')
                percentages.push(percentages[index]);   // Add it to the array

            percentages = percentages;
        } catch (ex) {
            alert(ex);
        } finally {
            sum = 100;
        }
    }

    function calculateTargetHoldings() {                           // Calculates the target amount per holding
        if (targetData.length === data.length) 
            targetData.splice(0, targetData.length);
        for (let i = 0; i < data.length; i++)  
            targetData.push((total + deposit) * (percentages[i] / 100));
    }

    function disableInputs() {
        const inputs = userInput.querySelectorAll("input");
        const labels = userInput.querySelectorAll("label");
        const button = userInput.querySelector("button");
        const color = getComputedStyle(document.documentElement).getPropertyValue('--gray-400');
        button.disabled = true;
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].disabled = true;
            labels[i].style.color = color;
        }
        const shadow = getComputedStyle(document.documentElement).getPropertyValue('--shadow-elevation-low');
        userInput.style.boxShadow = shadow;
    }

    function enableInputs() {
        const inputs = userInput.querySelectorAll("input");
        const labels = userInput.querySelectorAll("label");
        const button = userInput.querySelector("button");
        button.disabled = false;
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].disabled = false;
            labels[i].style.color = "inherit";
        }
        const shadow = getComputedStyle(document.documentElement).getPropertyValue('--shadow-elevation-mediumhigh');
        userInput.style.boxShadow = shadow;
    }
    
    // If this is an update rather than a newly provided percentage OR the last percentage to be added
    $: if (data.length === percentages.length && data.length !== 0 && sum === 100) {
        calculateTargetHoldings();  // Calculate the targetHoldings. 
    }
</script>
<div class="container">
    <div>
        <h1>Calculator V2</h1>
        <section id="1">
            <div>
                <div class="checkbox">
                    <input type="checkbox" id="checkbox1" class="checkbox__input" on:change={toggleNextSection} bind:checked={showContent[0]} bind:this={checkbox[0]}>
                    <label for="checkbox1" class="checkbox__label">
                        <h3>Step 1: <span style="font-weight: normal;">add your holdings to the <u>List of Assets</u></span></h3>
                    </label>
                </div>
                {#if !showContent[0]}
                <div in:slide out:slide class="content">
                    <div class="userInput" bind:this={userInput}>
                        <ol>
                            <li>
                                <label for="name">Holding</label>
                                <input id="name" type="text" bind:value={name}>
                            </li>
                            <li>
                                <label for="number" >Amount</label>
                                <input id="number" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');" type="number" bind:value={number}>
                            </li>
                            <li>
                                <button id="submit" on:click={addFund}>Add</button>
                            </li>
                        </ol>
                    </div>
                </div> 
                {/if}
            </div>
            <div>
                <input type="checkbox">
            </div>
        </section>
        <section id="2">
            <div>
                <div class="checkbox">
                    <input type="checkbox" id="checkbox2" class="checkbox__input" bind:checked={showContent[1]} bind:this={checkbox[1]}>
                    <label for="checkbox2" class="checkbox__label">
                    <h3>Step 2: <span style="font-weight: normal;">add the target fraction to each holding (in the right column)</h3>
                    </label>
                </div>  
                {#if !showContent[1]}
                <div in:slide out:slide class="content">
                    <table>
                        <caption>List of assets</caption>
                        <thead>
                            <tr>
                                <th scope="col">Holding</th>
                                <th scope="col">Amount</th>
                                <th scope="col">Desired %</th>
                            </tr>
                        </thead>
                        <tbody>
                        {#each data as dataPoint, i}
                            <tr>
                                <td>{labels[i]}</td>
                                <td>{data[i]}</td>
                                <td>
                                    <input id="number1" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');" type="number" min=0 max=100 on:change={() => addPercentage(i)} bind:value={percentages[i]}  >
                                </td>
                            </tr>    
                        {/each}
                        </tbody>
                        <tfoot>
                            <th scope="row" colspan="1">Total: </th>
                            <td>{#if typeof total === 'undefined' || total === null}{:else}{total}{/if}</td>
                        </tfoot>
                    </table>
                </div>
                {/if}
            </div>
            <div>
                <input type="checkbox">
            </div>
        </section>
        <section id="3">
            <div>
                <div class="checkbox">
                    <input type="checkbox" id="checkbox3" class="checkbox__input" bind:checked={showContent[2]} bind:this={checkbox[2]}>
                    <label for="checkbox3" class="checkbox__label">
                        <h3>Step 3: <span style="font-weight: normal;">decide how much you want to deposit</h3>
                    </label>
                </div>  
                    {#if !showContent[2]}
                    <div in:slide out:slide class="content">
                        <ol>
                            <li>
                                <label for="deposit" >Deposit</label>
                                <input id="deposit" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');" type="number" on:change={calculateTargetHoldings} bind:value={deposit}>
                            </li>
                        </ol>
                    </div>
                    {/if}    
            </div>
            <div>
                <input type="checkbox">
            </div>
        </section>
        <section id="4">
            <div>
                <div class="checkbox">
                    <input type="checkbox" id="checkbox4" class="checkbox__input" bind:checked={showContent[3]} bind:this={checkbox[3]}>
                    <label for="checkbox4" class="checkbox__label">
                    <h3>Step 4: <span style="font-weight: normal;">hit calculate!</h3>
                </label>
                </div>  
                {#if !showContent[3]}
                <div in:slide out:slide class="content">
                    yessirski
                </div>
                {/if}
            </div>
            <div>
                <input type="checkbox">
            </div>
        </section>
</div>
    <div>
        <Chart {data}{labels}{colors}/>
    </div>    
</div>

<style lang="scss">

h1 {
    margin-bottom: calc(var(--spacing-unit) * 2);
}

h2 {
    margin-bottom: calc(var(--spacing-unit) * 1.5);
}
h3 {
    margin-bottom: calc(var(--spacing-unit) * 2);
}

.container {
      max-width: 1300px;
      @media screen and (max-width: 600px) {
          max-width: 100vw;
      }
      margin: var(--spacing-unit) auto var(--spacing-unit);
      display: grid;
      justify-items: center;
      grid-template-columns: 1fr;
      @media screen and (min-width: 1200px) {
          grid-template-columns: 1fr 1fr;
      }
      div:last-child {
          max-width: 15rem;
      }
    }

ol {
    list-style: none;
    margin: 0 0 calc(var(--spacing-unit) * 1.5);
    padding: 0;
    li {
        display: grid;
        place-items: stretch;
        grid-template-columns: 1fr;
        grid-gap: 0.25rem;
        padding-bottom: 1rem;
        label {
            &:disabled {
                color: var(--gray-400);
            }
        }
        button {
            background: var(--primary-400);
            border: 0;
            padding: calc(var(--spacing-unit) * 0.25);
            border-radius: var(--corner-unit);
            &:hover {
                background: var(--primary-300);
                color: white;
                cursor: pointer;
            }
            &:disabled {
                color: var(--gray-400);
            }
            &:disabled:hover {
                background: var(--primary-400);
                color: var(--gray-400);
                cursor: auto;
            }
        }
    }
}

table {
    text-align: left;
    border-collapse: collapse;
    width: 100%;
    margin: 0 0 calc(var(--spacing-unit) * 1.5);
    caption {
        text-align: left;
        padding: calc(var(--spacing-unit) * 0.5) 0 calc(var(--spacing-unit) * 0.5);
        font-size: 1.2em;
        font-weight: bold;
    }
    th, td {
        padding: calc(var(--spacing-unit) * 0.5) var(--spacing-unit) calc(var(--spacing-unit) * 0.5);
    }
    thead {
        th:nth-child(1) {
            width: 30%;
        }
        th:nth-child(2) {
            width: 30%;
        }
        th:nth-child(3) {
            width: 60%;
        }
        border-bottom: 0.25rem solid var(--primary-200);
    }
    tfoot {
        border-top: 0.25rem solid var(--primary-200);
    }
}

.userInput {
    box-shadow: var(--shadow-elevation-mediumhigh);
    padding: var(--spacing-unit);
    margin-bottom: calc(var(--spacing-unit)* 1.5);
    max-width: 25rem;
}

button {
    color: inherit;
    display: inline-block;
    font-size: 1.2em;
    padding: 0.5rem 0.85rem 0.5rem;
    margin: var(--spacing-unit) var(--spacing-unit) 0rem;
    border-radius: calc(var(--corner-unit));
    background: rgb(239,245,245);
    background: linear-gradient(0deg, rgba(239,245,245,1) 0%, rgba(255,255,255,1) 100%);
    box-shadow: var(--shadow-elevation-mediumhigh);
    text-decoration: none;
    font-weight: 600;
    &:hover {
        box-shadow: var(--shadow-elevation-high);
        background: rgb(239,245,245);
        background: linear-gradient(0deg, rgba(239,245,245,1) 0%, rgba(255,255,255,1) 20%);
        color: inherit;
        transition: 0.2s ease-in-out;
    }
    @media screen and (max-width: 500px) {
        margin: var(--spacing-unit) calc(var(--spacing-unit) * 0.75) 0rem
    }
}

/* --------------------- Checkbox */
.checkbox {
    display: inline;
    position: relative;
    margin: 0 0 10px;
    font-size: inherit;
    line-height: 24px;
    
    &__input {
        position: absolute;
        top: 4px;
        left: 0;
        width: 1em;
        height: 1em;
        opacity: 0;    
        z-index: 0;
    }
    
    // Unchecked
    &__label {
        display: block;
        padding: 0 0 0 24px;
        cursor: pointer;
        
        &:before {
            content: '';
            position: absolute;
            top: -5px;
            left: -10px;
            width: 1.25em;
            height: 1.25em;
            background-color: transparent;
            border: 2px solid var(--primary-300);
            border-radius: 0.875em;
            z-index: 1;
            transition: all .28s cubic-bezier(.4, 0, .2, 1);
            transition-property: var(--primary-300), var(--primary-300);
        }
        
        &:after {
            content: '';
            position: absolute;
            top: 1px;
            left: 1px;
            width: 8px;
            height: 16px;
            border-bottom: 3.5px solid transparent;
            border-right: 3.5px solid transparent;
            transform: rotate(45deg);
            z-index: 2;
            transition:  var(--primary-300) .28s cubic-bezier(.4, 0, .2, 1);
        }
    }
    
    // Checked
    &__input:checked + &__label {
        &:before {
            background-color: var(--primary-300);
            border-color: var(--primary-300);
        }
        
        &:after {
            border-color: #fff;
        }
    }
}

section {
    display: grid;
    grid-template-columns: 3fr 1fr;
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
