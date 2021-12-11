<script>
    export let dateSortedPosts;

    import Date from '$lib/Date.svelte';
</script>

<div class="blog-parent">
    {#each dateSortedPosts as { path, metadata: { title, snippet, date } }}
        <a class="divlink" href={`${path.replace(".md", "")}`}>
        <div class="blogPost"> 
            <h3>{title}</h3>
            <span class="date"><Date {date}/></span>
            <p>{snippet}</p>
        </div>
        </a>
    {/each}
</div>

<style lang="scss">
    .blog-parent {
        display: grid;
        grid-auto-flow: dense;
        grid-gap: 1.5rem;
        justify-content: stretch;
        align-content: stretch;
        grid-template-columns: 1fr;
        margin-bottom: calc(var(--spacing-unit) * 2);
        @media screen and (min-width: 900px) {
            grid-template-columns: 1fr 1fr;
        }
    }

    .divlink {
    height: 100%;
    text-decoration: none;
    color: inherit;
    .date {
        opacity: 0.5;
        font-size: 1rem;
    }
        &:hover {
            &:hover {
                h3 {
                    color: var(--primary-300);
                }
                .blogPost {
                    transform: translate(-0.05rem, -0.05rem);
                    transition: 0.1s ease;
                    box-shadow: var(--shadow-elevation-mediumhigh);
                }
                .allPostButton {
                    background: var(--primary-300);
                }
            }
        }
    }

    .blogPost {
        overflow: hidden;
        background: hsla(0, 0%, 100%, 0.5);
        border-radius: var(--corner-unit);
        position: relative;
        box-shadow: var(--shadow-elevation-medium);
        padding: var(--spacing-unit);
        p {
            padding: 0;
            margin: 0;
        }
        h3 {
            padding: 0;
            margin: var(--spacing-unit) 0 var(--spacing-unit);
        }
    }
    
</style>