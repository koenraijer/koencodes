<script>
    export let tags = [];
</script>

{#each tags as tag}
    <a href={`/tags/${tag}`}>#{tag}</a>
{/each}

<style lang="scss">
                a {
                    text-decoration: none;
                    padding-right: 0.5rem;
                    &:hover {
                    text-decoration: underline;
                    }
                    color: #06D6A0;
                }
</style>