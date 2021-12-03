<script>
    import { seo } from "$lib/store.js"
  </script>
  
  <svelte:head>
    <title>{seo.title}</title>
    <meta name="description" content={seo.description}>
  </svelte:head>