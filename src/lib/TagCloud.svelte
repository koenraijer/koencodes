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
                    margin: 0.5rem 0.5rem 0rem 0.5rem;
                    border-radius: 10px;
                    background: var(--primary-400);
                    text-decoration: none;
                    &:hover {
                    background: var(--primary-300);
                    color: white;
                    }
                }

                div {
                    margin: var(--spacing-unit) var(--spacing-unit) var(--spacing-unit) 0;
                    padding: var(--spacing-unit) var(--spacing-unit) var(--spacing-unit) 0;
                }
</style>


