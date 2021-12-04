<script>
import { page } from "$app/stores";

    import Nav from "$lib/Nav.svelte";

    export let location;
    export let open = false;
</script>


<Nav />
<h1 class="sitetitle"><a on:click={open = false} href="/">koen.wtf</a></h1>
<div class="container">
  <slot />
</div>


<style lang="scss">
  
    :root {
        $dark: #111344;
        scroll-behavior: smooth;
        max-width: 60ch;
        padding: 0.5rem 0.5rem 1rem;
        margin: auto;
        line-height: 1.3;
        font-size: 1.2rem;
        color: $dark;
        font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        @media screen and (min-width: 600px) {
        padding: 0.5rem 2rem 2rem;
        font-size: 1.5rem;
      }
    }

    body {
      position: fixed;
    }

    .container {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
      @media screen and (min-width: 600px) {
        padding-left: 1rem;
        padding-right: 1rem;
      }
    }

    a {
      text-decoration: none;
      color: inherit;
      &:visited {
        color: inherit;
      }
    }

    .sitetitle {
      a {
        &:hover {
        text-decoration: underline;
      }
      }
    }
</style>

