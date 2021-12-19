<script>
    let tagArray = ["SvelteKit"]; 
</script>

<div>
{#each tagArray as tag}
    <a href={`/tags/${tag}`}>{tag}</a>
{/each}
</div>
<style lang="scss">

                a {
                    color: inherit;
                    padding: 0.5rem 0.85rem 0.5rem;
                    margin: 0 calc(var(--spacing-unit) * 0.5) 0 0;
                    border-radius: 10px;
                    background: var(--primary-400);
                    box-shadow: var(--shadow-elevation-low);
                    text-decoration: none;
                    &:hover {
                    background: var(--primary-500);
                    box-shadow: var(--shadow-elevation-medium);
                    }
                }

                div {
                    margin: calc(var(--spacing-unit) + var(--spacing-unit) var(--spacing-unit) 0;
                }
</style>


