<script>
    let tagArray = ["SvelteKit", "ChartJS", "D3", "Data analysis"]; 
</script>

<div class="tag-parent">
        {#each tagArray as tag}
        <div class="scale-background-on-hover">
        <a href={`/tags/${tag}`}>{tag}</a>
    </div>
        {/each}
</div>

<style lang="scss">

                a {
                    color: inherit;
                    background: transparent;
                    text-decoration: none;
                }

                div {
                    margin: var(--spacing-unit) 0 calc(var(--spacing-unit) * 2.5);
                    div {
                        border-radius: 10px;
                        margin: 0 calc(var(--spacing-unit) * 0.5) calc(var(--spacing-unit) * 0.5) 0;
                        padding: 0.5rem 0.85rem 0.5rem;
                    }
                }

                .scale-background-on-hover {
                position: relative;
                }

                .scale-background-on-hover::after {
                background-color: var(--gray-450);
                box-shadow: var(--shadow-elevation-low);
                
                border-radius: var(--corner-unit);
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: -1;
                transition: transform 250ms;
                }
                .scale-background-on-hover:hover::after {
                transform: scale(1.05);
                box-shadow: var(--shadow-elevation-medium);
                }

                .tag-parent {
                    display: flex;
                    flex-flow: row wrap;
                }
</style>


