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
        position: fixed;
        height: 100vh;
        width: 50vw;
        top: 0px;
        z-index: 8 !important;
        overflow-y: hidden;
        background-color: rgba(17, 19, 68, 0.95);
        color: white;
        margin: auto;
    }
    
    #menu {
        position: absolute;
        padding: 2rem;
        margin: 0;
        left: 50%;
        transform: translateX(-50%);
        max-width: 50vw;
    }

    :global(.dark) {
        .sidemenu {
            background-color: rgba(255, 255, 255,0.95);
            color: #111344
        }
        
    }

</style>

<div class="sidemenu" style="width: {width}; left: {open ? '0px' : ('-' + width)}; transition: left {duration}s ease-in-out">
    <div id="menu" style="padding: {padding}; padding-top: {paddingTop};">
        <slot></slot>
    </div>
</div>