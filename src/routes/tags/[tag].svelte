<script context="module">

    const allPosts = import.meta.glob("../blog/*.md");

    let body = [];

    for (let path in allPosts) {
        body.push(
            allPosts[path]().then(({metadata}) => {
                return { path, metadata };
            }) 
        );
    }

    export const load = async ( { page } ) => {
        const posts = await Promise.all(body);
        const tag = page.params.tag;

        const filteredPosts = posts.filter((post) => {
            return post.metadata.tags.includes(tag);
        });

        return {
            props: {
                filteredPosts,
                tag, 
            },
        };
    };
</script>

<script>
    export let filteredPosts;
    export let tag;

    import Seo from '$lib/Seo.svelte'

    let pageTitle = tag
    let metaDescription = "All blog posts about {tag}";

    import Variables from '$lib/Variables.svelte';
    
</script>

<Seo {pageTitle}{metaDescription}/>

<Variables/>

<main class="container">
    <h1>{tag.replace(/^\w/, (c) => c.toUpperCase())}</h1>

    <div class="blog-parent">
        {#each filteredPosts as { path, metadata: { title, date, snippet } }}
            <a class="divlink" href={`/blog/${path.replace(".md", "")}`}>
                <div class="blogPost">
                    <h3>{title}</h3>
                    <span class="date">{new Date(date).toLocaleDateString('en-us', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <p>{snippet}</p>
                </div>
            </a>
        {/each}
    </div>
</main>

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
        background: white;
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

    .container {
      max-width: 1300px;
      margin: auto;
      position: relative;
      padding: 0 var(--spacing-unit) 0;    
    }
</style>