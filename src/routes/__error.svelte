<script>
    import Seo from '$lib/Seo.svelte'

    let pageTitle = "Error!"
    let metaDescription = "Error page. Page not found."

</script>

<Seo {pageTitle}{metaDescription}/>
<main class="container">
    <div>
        <h1>Page not found.</h1>
        <p>You are in grave danger. <a href="/">Get back to safety</a>.</p>    
    </div>
</main>

<style lang="scss">
    .container {
      max-width: 1300px;
      margin: auto;
      position: relative;
      padding: 0 var(--spacing-unit) 0;    
      display: grid;
      align-items: center;
      text-align: center;
      div {
          margin-top: calc(var(--spacing-unit) * 4);
      }
    }

    a {
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