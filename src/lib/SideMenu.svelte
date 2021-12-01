<script>
    export let open;

    export let duration;
    export let width;
    export let padding;
    export let paddingTop;
    export let backgroundColor;
    export let menuColor;
</script>

<style lang="scss">
    .sidemenu {
        position: absolute;
        height: 100vh;
        width: 50vw;
        top: 0px;
        z-index: 8 !important;
        overflow-y: auto;
    }
    
    #menu {
        text-align: left;
        max-width: 60ch;
    }

    .sidemenu {
        background-color: #111344;
        color: white;
        margin: auto;

    }

    :global(.dark) {
        .sidemenu {
            background-color: white;
            color: #111344
        }
        
    }

</style>

<div class="sidemenu" style="width: {width}; left: {open ? '0px' : ('-' + width)}; transition: left {duration}s ease-in-out">
    <div id="menu" style="padding: {padding}; padding-top: {paddingTop};">
        <slot></slot>
    </div>
</div>