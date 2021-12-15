<script lang="ts">
    import TagCloud from '$lib/TagCloud.svelte';
    
    export let open = false;

    import  "../styles/code.css"
</script>

<div class="wrapperForFooter">
    <div class="container">
      <header>
        <div>
          <h1 class="sitetitle"><a href="/">koen codes</a></h1>  
        </div>
        <div>
          <a href="mailto:koen@&#9728;&#65039;.gg">koen@&#9728;&#65039;.gg</a>
        </div>
      </header>
    </div>
    
    <main>
    
        <slot />
    
    </main>

  <div class="footerWrapper">
    <img alt="wavy line to separate content from footer" class="footer-wave" src="../footer-waveline.svg">
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
  
</div>



<style lang="scss">
  
    :root {
        scroll-behavior: smooth;
        line-height: 1.3;
        font-size: 1rem;
        overflow-x: hidden;
        color: var(--primary-100);
        font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif, 'Apple Color Emoji';
        @media screen and (min-width: 400px) {
          font-size: 1.2rem;
        }
        @media screen and (min-width: 600px) {
          font-size: 1.5rem;
        }
    }

    .sitetitle {
      color: var(--primary-100);
      font-size: 2.7em;
      font-family: 'Poppins', sans-serif;
      a {
                    position: relative;
                    font-weight: 700;
                    color: inherit;
                    text-decoration: none;
                    width: 100%;
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
                    img {
                      max-width: 20rem;
                      max-height: 5rem;
                      margin: 0;
                      padding: 0;
                      display: inline-block;
                    }
     
      }
    }

    header {
      margin-top: var(--spacing-unit);
      position: relative;
      display: grid;
      grid-template-columns: 3fr 1fr;
      align-items: center;
      div:first-child{
        justify-self: start;
        align-items: center;
      }
      div:nth-child(2){
        justify-self: end;
        display: grid;
        align-items: center;
        a {
        position: relative;
        color: var(--primary-100);
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
            background: var(--primary-100);
        }
        &:hover:before{
            display: block;
        }
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
      margin-bottom: 0;
    }

    .footerWrapper {
      height: 5rem;
      background: transparent;
      width: 100vw;
      left: 50%;
      right: 50%;
      margin-left: -50vw;
      margin-right: -50vw;
      margin-bottom: 0;
      position: relative;
    }
    footer {
      display: grid;
      div:nth-child(3) {
        display: none;
      }
      align-items: start;
      justify-items: center;
      grid-gap: var(--spacing-unit);
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

