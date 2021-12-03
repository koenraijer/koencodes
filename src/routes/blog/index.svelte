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

    export const load = async () => {
        const posts = await Promise.all(body);

        return {
            props: {
                posts, 
            },
        };
    };
</script>

<script>

    export let posts;

    const dateSortedPosts = posts.slice().sort((post1, post2) => {
        return new Date(post2.metadata.date) - new Date(post1.metadata.date);
    });
    import Seo from '$lib/Seo.svelte'

let pageTitle = "blog"
let metaDescription = "Collection of all blog posts on the website."

</script>
<Seo {pageTitle}{metaDescription}/>

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

