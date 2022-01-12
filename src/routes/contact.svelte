<script>
    import Contact from '$lib/Contact.svelte'
</script>
<div class="container">
    <div class="grid">
        <div>
            <h1>Let's talk</h1>
            <h2>Got a project in mind? Fill in the form and I'll get back to you right away.</h2>
        </div>
        <Contact/>
    </div>
</div>

<style lang="scss">
    .container {
        max-width: 1300px;
        margin: auto;
        padding: 0 var(--spacing-unit);
        margin-bottom: calc(var(--spacing-unit) * 2);
        @media screen and (min-width: 900px) {
            grid-template-columns: 1fr 1fr;
            grid-gap: calc(var(--spacing-unit) * 1.5);
        }
    }
    
    .grid {
        display: grid;
        grid-template-columns: 1fr;
        @media screen and (min-width: 900px) {
            grid-template-columns: 1fr 1fr;
        }
        padding: calc(var(--spacing-unit) * 8) 0 calc(var(--spacing-unit) * 2);
        h2 {
            font-weight: normal;
        }
    }
</style>