<script>
    export let title;
    export let snippet;
    export let date;
    export let tags;
    export let backgroundNumber = 4;

    import Variables from '$lib/Variables.svelte';
    import Seo from '$lib/Seo.svelte';
    import Date from '$lib/Date.svelte';

    let pageTitle = title;
    let metaDescription = snippet;

    let backgroundLink = '../static/postBackground-' + backgroundNumber + '.svg' ;
</script>

<Variables/>
<Seo {pageTitle}{metaDescription}/>

<div class="container">
    <div class="post-hero">
        <img class="background" src="{backgroundLink}">
        <span class="date"><Date {date}/></span>
        <h1>{ title }</h1>
    </div>
    
    <slot></slot>
</div>


<style>
    .container {
      max-width: 60ch;
      margin: auto;
      position: relative;
      padding: var(--spacing-unit);    
    }
  
    .post-hero {
        padding: calc(var(--spacing-unit) * 4) 0 calc(var(--spacing-unit) * 4);
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


  </style>