<script context="module">
    const allPosts = import.meta.glob("./*.md");

    let body = [];

    for (let path in allPosts) {
        body.push(
            allPosts[path]().then(({metadata}) => {
                return { path, metadata };
            }) 
        );
    }

    export const load = async ({page}) => {
        const posts = await Promise.all(body);
        const tag = page.params.tag; 
        return {
            props: {
                posts, 
                tag, 
            },
        };
    };
</script>

<script>

    export let posts;
    export let tag;

    const dateSortedPosts = posts.slice().sort((post1, post2) => {
        return new Date(post2.metadata.date) - new Date(post1.metadata.date);
    });
    import Seo from '$lib/Seo.svelte'

let pageTitle = "blog"
let metaDescription = "Collection of all blog posts on the website."

</script>
<Seo {pageTitle}{metaDescription}/>
<h1>Blog</h1>
<h2>All posts</h2>
<div class="blog">
    {#each dateSortedPosts as { path, metadata: { title, tags, date } }}
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
<h2>Tags</h2>
<div class="tags">

</div>
<style lang="scss">

    h1, h2 {
        margin-left: -0.5rem;
        @media screen and (min-width: 600px) {
        margin-left: -1rem;
      }
    }
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

