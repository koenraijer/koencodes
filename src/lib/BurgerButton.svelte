<script>
    export let open;

    export let duration;
    export let burgerColor;
    export let menuColor;
    
</script>

<style lang="scss">

    button {
        display: inline-block;
        float: right;
        position: relative;
        margin-left: auto;
        right: 0px;
        top: 0px;
        margin: 0.5rem;
        margin-right: 0;
        z-index: 10;
        background-color: Transparent;
        background-repeat: no-repeat;
        border: none;
        cursor: pointer;
        overflow: hidden;
        outline: none;
    }

    .hamburger line {
		stroke: #111344;
		stroke-width: 6;
    }

    :global(.dark) {
        .hamburger line {
            stroke: white;
        }


        .open {
            .hamburger line {
                stroke: #111344;
            }
        }
    }

    .open {
        .hamburger line {
            stroke: white;
        }
    }
    /* rotate the top line */
    .open #top {
        transform: translate(12px, 0) rotate(90deg)
    }

    /* rotate the bottom line */
    .open #bot {
        transform: translateY(32px) rotate(-90deg)
    }
</style>

<button name="menu toggler" id="burger-button" class:open on:click={() => open = !open} style="transition: color {duration}s ease-in-out; color: {open ? menuColor : burgerColor};">
	<svg class="hamburger" width=32 height=32>
        <line id="top" x1=0 y1=9    x2=32 y2=9    style="transition: transform {duration}s ease-in-out, opacity {duration}s ease-in-out;"/>
		<line id="bot" x1=0 y1=28    x2=32 y2=28  style="transition: transform {duration}s ease-in-out, opacity {duration}s ease-in-out;"/>
	</svg>
</button>