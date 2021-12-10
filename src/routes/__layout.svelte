<script>
    import Variables from "$lib/Variables.svelte";
    import TagCloud from '$lib/TagCloud.svelte';

    export let location;
    export let open = false;

</script>
<Variables/>
<div class="wrapperForFooter">
    <div class="container">
      <header>
        <h1 class="sitetitle"><a on:click={open = false} href="/">koen.codes</a></h1>  
      </header>
    </div>
    
    <main>
    
        <slot />
    
    </main>
</div>
<div class="footerWrapper">
  <img class="footer-wave" src="../static/footer-waveline.svg">
  <footer>
    <div>
      <h3><a href="/">koen.codes</a></h3>
      <h4>Thanks for reading!</h4>
    </div>
    <div>
      <h3>Links</h3>
      <h4><a href="/blog">Blog</a></h4>
      <h4><a href="#projects">Projects</a></h4>
    </div>
    <div>
      <h3>Topics</h3>
      <TagCloud/>
    </div>

  </footer>
</div>


<style lang="scss">
  
    :root {
        scroll-behavior: smooth;
        line-height: 1.3;
        font-size: 1.2rem;
        overflow-x: hidden;
        color: var(--primary-100);
        font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        @media screen and (min-width: 600px) {
          font-size: 1.5rem;
        }
    }

    .sitetitle {
      color: var(--primary-100);
      font-size: 2.3em;
      a {
                    position: relative;
                    font-weight: 700;
                    color: inherit;
                    text-decoration: none;
                    &:before {
                        z-index: 1;
                        content: '';
                        display: none;
                        position: absolute;
                        bottom: -0.1em;
                        left: 0em;
                        width: 100%;
                        height: 0.1em;
                        background: var(--primary-100);
                    }
                    &:hover:before{
                        display: block;
                    }
            }
    }

    .container {
      max-width: 1300px;
      margin: auto;
      padding: 0 var(--spacing-unit) var(--spacing-unit);
    }

    .wrapperForFooter {
      min-height: calc(100vh - 10rem);
      margin-bottom: calc(var(--spacing-unit));
    }

    .footerWrapper {
      height: 12rem;
      background: transparent;
      width: 100vw;
      left: 50%;
      right: 50%;
      margin-left: -50vw;
      margin-right: -50vw;
      margin-bottom: -1rem;
      position: relative;
    }
    footer {
      display: grid;
      div:nth-child(3) {
        display: none;
      }
      align-items: stretch;
      grid-template-columns: 1fr 1fr;
      @media screen and (min-width: 900px) {
        grid-template-columns: 1fr 1fr 1fr;
        div:nth-child(3) {
        display: block;
      }
      }

      height: 10rem;
      z-index: -2 !important;
      background: transparent;
      max-width: 1300px;
      margin: auto;
      padding: calc(var(--spacing-unit) * 2);
      h3 {
      color: var(--primary-100);
        a {
            position: relative;
            font-weight: 700;
            color: inherit;
            text-decoration: none;
            &:before {
                z-index: 1;
                content: '';
                display: none;
                position: absolute;
                bottom: -0.1em;
                left: 0em;
                width: 100%;
                height: 0.1em;
                background: var(--primary-100);
            }
            &:hover:before{
                display: block;
            }
          }
        }
      h4 {
        font-weight: 500;
      }
    }

    .footer-wave {
      margin: auto;
      width: 100%;
      transform: translateY(2rem);
    }

    a {
        position: relative;
        color: var(--secondary-300);
        font-weight: 500;
        text-decoration: none;
        width: 100%;
        &:before {
            z-index: -100;
            content: '';
            display: none;
            position: absolute;
            bottom: -0.1em;
            left: 0em;
            width: 100%;
            height: 0.1em;
            background: var(--secondary-300);
        }
        &:hover:before{
            display: block;
        }
      }
</style>

