<script>
    import Chart from '$lib/Chart.svelte'
    import {browser} from '$app/env'

    // Init chart params
    let data = [];
    let labels = [];
    let colors = ["#ff5100","#00bdb0","#993000", "#00ffee", "#949e9d", "#bfd9d7", "#abede9", "#FFA076", "#6f7b7a"];

    // Init params for inputs/interactivity
    let number;
    let name;
    let total;

    // Init params for calculating
    let percentages = [];

    // Add const for calculating sum of an array
    const reducer = (previousValue, currentValue) => previousValue + currentValue;

    // FUNCTION DECLARATIONS
    function addFund() {
        // Check if both number and name have a value
        if (typeof name === 'undefined' || name === null) {
            alert("Please provide a name for your asset.");
            return;
        }
        if (typeof number === 'undefined' || number === null) {
            alert("Please provide an amount for your asset");
            return;
        }

        // Add number and name to their respective arrays
        data.push(number);
        labels.push(name);

        // Update the arrays to which something was just added
        data = data;
        labels = labels;

        // Update total value
        total = data.reduce(reducer);

        // Reset temporary params
        number = null;
        name = null;
    };

    function addPercentage(index) {
        // Check if percentage is between 0 and 100
        if (percentages[index] < 0 || percentages[index] > 100) {
            percentages[index] = 0;
            alert("Please enter a value between 1 and 100")
            return;
        }
        // Check if sum of percentages is >100
        let sum = percentages.reduce(reducer);
        if (sum > 100) {
            alert("You have more than 100%!")
            percentages[index] = 0;
            return;
        }

        // Check if percentages[index] is already there
        if (typeof percentages[index] === 'undefined') {
            percentages.push(percentages[index]);
        }
        percentages = percentages;
        console.log(percentages);
    }


</script>

<div class="container">

    <div>
        <div>
            <ol>
                <li>
                    <label for="name">Asset</label>
                    <input id="name" type="text" bind:value={name}>
                </li>
                <li>
                    <label for="number" >Amount</label>
                    <input id="number" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');" type="number" bind:value={number}>
                </li>
                <li>
                    <button id="submit" on:click={addFund}>Add fund</button>
                </li>
            </ol>
        </div>
        <table>
            <caption><h3>List of assets</h3></caption>
            <thead>
                <tr>
                    <th scope="col">Asset</th>
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
    
    <div>
        <Chart {data}{labels}{colors}/>
    </div>    
</div>

<style lang="scss">

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
          grid-template-columns: 1fr 2fr;
      }
      div:last-child {
          max-width: 15rem;
      }
    }

ol {
    list-style: none;
    margin: 0;
    padding: 0;
    li {
        display: grid;
        place-items: stretch;
        grid-template-columns: 1fr;
        grid-gap: 0.25rem;
        padding-bottom: 1rem;
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
        }
    }
}

table {
    text-align: left;
    border-collapse: collapse;
    width: 100%;
    caption {
        text-align: left;
        padding: calc(var(--spacing-unit) * 0.5) var(--spacing-unit) calc(var(--spacing-unit) * 0.5);
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
