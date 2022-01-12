<script lang="ts">
    export let open = false;
    import { afterUpdate } from 'svelte';

    import Favicon from '$lib/Favicon.svelte';
    let blog;
    let projects;
    let contact;
    let home;
  
    let active = false;

    import  "../styles/code.css"
    export let url;

    afterUpdate(() => {
        if (url === '/') {
          blog = false;
          home = true;
          contact = false
          projects = false;
        } else if (url === '/blog') {
          blog = true;
          home = false;
          contact = false
          projects = false;
        } else if (url === '/contact') {
          blog = false;
          home = false;
          contact = true
          projects = false;
        }
    });
    const emojiArray = ['🪴', '🪴', '🪴', '🪴', '🪴', '🪴'];
    let emoji = emojiArray[Math.floor(Math.random() * 6)];

</script>

<script context="module">
  export const load = async ({ page }) => ({
    props: {
      url: page.path,
    },
  })
</script>

<div class="wrapperForFooter">
  <div class="header-container">
    <header>
      <h1 class="sitetitle"><a href="/">
        <Favicon/>
          Koen
          codes
      </a></h1>  
      <div>
          <a href="/" sveltekit:prefetch class:active="{home === true}" >Home</a>
          <a href="/blog" sveltekit:prefetch class:active="{blog === true}">Blog</a>
          <a href="/contact" sveltekit:prefetch class:active="{contact === true}">Contact</a>
          
      </div>
  </header>
  </div>

    <main>
    
        <slot />
    
    </main>
</div>
  <div class="footerWrapper">
    <footer>
      <div>
        <h3><a href="/"><Favicon/>
          Koen codes</a></h3>
        <span>Thanks for reading!</span>
      </div>
      <div>
        <div>
          <h3>Links</h3>
          <a href="/blog">Blog</a>
          <a href="/#projects">Projects</a>
          <a href="/contact">Contact</a>
        </div>
      </div>
    </footer>
  </div>

<style lang="scss">
  
    .sitetitle {
      color: var(--primary-100);
      padding-left: 1rem;
      position: relative;
      width: 100%;
      font-size: 1.5em;
      @media screen and (max-width: 400px) {
        font-size: 2.1em;
      }
      a {
        position: relative;
        font-weight: 700;
        color: inherit;
        text-decoration: none;
        width: 100%;
        &:hover:before {
          display: none;
        }
      }
      
    }

    header {
      margin: calc(2* var(--spacing-unit)) auto 0;
      max-width: 1300px;
      display: flex;
      flex-flow: row nowrap;
      grid-template-columns: minmax(20rem, 4fr) repeat(auto-fill, minmax(7.5rem, 1fr));
      justify-items: space-between;
      align-items: center;
      div {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-end;
        a {
          margin-right: var(--spacing-unit);
          position: relative;
          width: 5rem;
          font-weight: 500;
          color: var(--primary-100);
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
        }
      }
    }

    .header-container {
      max-width: 1300px;
      margin: auto;
      padding: 0;

    }
    .container {
      max-width: 1300px;
      margin: auto;
      padding: 0;
    }

    .wrapperForFooter {
      min-height: calc(100vh - 10rem);
      margin: 0;
    }

    .footerWrapper {
      background: var(--gray-400);
      width: 100vw;
      left: 50%;
      right: 50%;
      margin: calc(var(--spacing-unit) * 5) -50vw -2rem -50vw;
      position: relative;
    }
    footer {
        display: grid;
        align-items: start;
        justify-items: start;
        grid-gap: var(--spacing-unit);
        grid-template-columns: 1fr 1fr;
        div {
          h3 {
            a {
              &:hover:before {
                display: none;
              }
            }
          }
        }
        div:nth-child(2) {
          display: flex;
          justify-content: end;
          div {
            display: flex;
            flex-flow: column nowrap;
          }
        }
        a {
        position: relative;
        color: var(--secondary-300);
        font-weight: 500;
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
            background: var(--secondary-300);
        }
        &:hover:before{
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

      .active {
        &:before {
          display: block;
        }
      }
</style>

<!--koen@&#9728;&#65039;.gg-->