<script>
import { page } from "$app/stores";

    import Nav from "$lib/Nav.svelte";

    export let location;
</script>


<Nav />
<h1 class="sitetitle"><a href="/">koen.wtf</a></h1>  
<div class="container">
  <slot />
</div>


<style lang="scss">        
    :root {
        max-width: 60ch;
        padding: 2rem;
        margin: auto;
        line-height: 1.3;
        font-size: 1.5rem;
        color: #111344;
        font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }

    .container {
      padding-left: 1rem;
      padding-right: 1rem;
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

