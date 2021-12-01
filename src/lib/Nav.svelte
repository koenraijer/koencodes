<script>
    import BurgerButton from './BurgerButton.svelte'
    import SideMenu from './SideMenu.svelte'

    export let open = false;

    export let duration = 0.4;
    export let width = '100vw';
    export let padding = '2rem';
    export let paddingTop = '4rem';
    export let backgroundColor = '#111344';
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

    import DarkMode from "svelte-dark-mode";
    import { afterUpdate } from "svelte";

    let theme;

    afterUpdate(() => {
        document.body.className = theme; // "dark" or "light"
    });

    $: switchTheme = theme === "dark" ? "light" : "dark";

</script>
<nav>
  <BurgerButton {...burgerProps} bind:open={open}/>

<SideMenu {...menuProps} bind:open={open}>
  <h2><a href='/'>Home</a></h2>
  <h2><a href='/projects'>Projects</a></h2>
  <h2><a href='/blog'>Blog</a></h2>
  <h2><a href="mailto:koenraijer@protonmail.com">Mail</a></h2>
  <DarkMode bind:theme />
  <input class="toggle" type="checkbox" on:click={() => (theme = switchTheme)}> 
</SideMenu>
</nav>

<style lang="scss"> 
  :global(.dark) {
      background: #111344;
      color: #f1f8ff;
    }

    .toggle {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        width: 1.5rem;
        height: 0.75rem;
        display: inline-block;
        position: relative;
        border-radius: 0.5rem;
        overflow: hidden;
        outline: none;
        border: none;
        cursor: pointer;
        background-color: #111344;
        transition: background-color ease-in-out 0.3s;
        &:checked {
          background-color: white;
          &:before {
            left: 0.755rem;
            background-color: #111344;
          }
        }
        &:before {
          content: '';
          display: block;
          position: absolute;
          z-index: 2;
          width: 0.70rem;
          height: 0.70rem;
          background: white;
          left: 0.05rem;
          top: 0.025rem;
          border-radius: 50%;
          font: 10px/28px;
          color: #111344;
          transition: all cubic-bezier(0.3, 1.25, 0.7, 1) 0.35s;
        }
    }

  ul {
        display: flex;
        list-style: none;
        justify-content: space-between;
  }

  a {
    color: inherit;
  }
</style>