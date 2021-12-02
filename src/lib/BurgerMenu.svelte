<script>
    import BurgerButton from './BurgerButton.svelte'
    import SideMenu from './SideMenu.svelte'

    export let open = false;

    export let duration = 0.5;
    export let width = '300px';
    export let padding = '2rem';
    export let paddingTop = '4rem';
    export let backgroundColor = 'rgb(1, 0, 74)';
    export let burgerColor = 'rgb(18.4, 18.4, 18.4)';
    export let menuColor = 'white';

    let burgerProps = {
        duration: duration,
        burgerColor: burgerColor,
        menuColor: menuColor
    }

    let menuProps = {
        duration: duration,
        width: width,
        padding: padding,
        paddingTop: paddingTop,
        backgroundColor: backgroundColor,
        menuColor: menuColor
    }
</script>

<BurgerButton {...burgerProps} bind:open={open}/>

<SideMenu {...menuProps} bind:open={open}>
    <slot></slot>
</SideMenu>
