<script>
    export let title;
    export let snippet;
    export let date;
    export let tags;
    export let backgroundNumber = 4;

    import Seo from '$lib/Seo.svelte';
    import Date from '$lib/Date.svelte';

    let pageTitle = title;
    let metaDescription = snippet;

    let backgroundLink = '/postBackground-' + backgroundNumber + '.svg' ;
</script>

<Seo {pageTitle}{metaDescription}/>

<article class="container">
    <div class="post-hero">
        <img alt="colored shapes to illustrate the title" class="background" src="{backgroundLink}">
        <span class="date"><Date {date}/></span>
        <h1>{ title }</h1>
    </div>
    <div class="post-content">
        <slot></slot>
    </div>
</article>


<style lang="scss">
    .container {
      max-width: 60ch;
      margin: auto;
      position: relative;
      padding: var(--spacing-unit);    
    }
  
    .post-hero {
        padding: calc(var(--spacing-unit) * 4) 0 calc(var(--spacing-unit) * 2);
        display: grid;
        align-items: center;
        position: relative;
    }

    h1 {
        text-align: center;
        margin: var(--spacing-unit) 0 calc(var(--spacing-unit) * 4);
    }
    
    .date {
        text-align: center;
    }

    .background {
        position: absolute;
        z-index: -1;
        max-width: 30rem;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -60%);
    }

    .post-content :global(a) {
        position: relative;
        color: var(--secondary-300);
        font-weight: 500;
        text-decoration: none;
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