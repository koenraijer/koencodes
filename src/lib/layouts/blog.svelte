<script>
    export let title;
    export let snippet;
    export let date;
    export let tags;

    import Seo from '$lib/Seo.svelte';
    import Date from '$lib/Date.svelte';

    let pageTitle = title;
    let metaDescription = snippet;

</script>

<Seo {pageTitle}{metaDescription}/>

<div class="container">
    <div class="post-hero">
        <span class="date"><Date {date}/></span>
        <h1>{ title }</h1>
        <h3>{ snippet }</h3>
    </div>
    <div class="post-content">
        <slot></slot>
    </div>
</div>

<style>
    
    .container {
      max-width: 60ch;
      background: var(--primary-500);
      margin: auto;
      position: relative;
      padding: var(--spacing-unit);    
    }

    .post-hero h3 {
        font-weight:  normal;
        text-align: center;
        margin-bottom: calc(var(--spacing-unit) * 4);
    }
  
    .post-hero {
        margin: calc(var(--spacing-unit) * 4) 0 0;
        padding: calc(var(--spacing-unit) * 4) 0 calc(var(--spacing-unit) * 2);
        display: grid;
        align-items: center;
        position: relative;
    }

    h1 {
        text-align: center;
        margin: var(--spacing-unit) 0 var(--spacing-unit);
    }

    .post-content :global(h2) {
        margin: calc( 2* var(--spacing-unit)) 0 var(--spacing-unit);
    }
    
    .date {
        text-align: center;
    }

    .post-content :global(a) {
        position: relative;
        color: var(--secondary-300);
        font-weight: 500;
        text-decoration: none;
    }

    .post-content :global(a::before){
        z-index: 10;
        content: '';
        display: none;
        position: absolute;
        bottom: -0.1em;
        left: 0em;
        width: 100%;
        height: 0.1em;
        background: var(--secondary-300);
    }

    .post-content :global(a:hover::before) {
        display: block;
    }

    :global(figure) {
        margin: calc(2* var(--spacing-unit));
    }
    
    :global(figure) :global(img) {
        max-height: 50vh;
        max-width: 50rem;
        margin: auto;
    }

    :global(figcaption) {
        font-size: 0.9em;
        text-align: center;
        font-style: italic;
    }
    
  </style>
