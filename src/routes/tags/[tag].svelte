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
    
</script>

<Seo {pageTitle}{metaDescription}/>

<h1>{tag.replace(/^\w/, (c) => c.toUpperCase())}</h1>

<div class="blog">
    {#each filteredPosts as { path, metadata: { title, tags, date } }}
        <h3><a href={`/blog/${path.replace(".md", "")}`}>{title}</a></h3>
        <span class="date">{new Date(date).toLocaleDateString()}</span>
        {#each tags as tag}
        <span class="tag">
            <a href={`/tags/${tag}`}>#{tag}</a>&nbsp;
        </span>
        {/each}
    <hr>
    {/each}
</div>


<style lang="scss">
    .blog {
            h3 {
                margin-bottom: 0.25rem;
                a {
                    &:hover {
                        text-decoration: underline;
                    }
                }
            }

            a {
                    color: inherit;
                    text-decoration: none;
                }

            p{
                margin-top: 0;
            }

            .tag {
                a {
                    &:hover {
                    text-decoration: underline;
                    }
                    color: #06D6A0;
                }
                
            }
    }

    .date {
        opacity: 0.5;
        font-size: 1rem;
    }
</style>