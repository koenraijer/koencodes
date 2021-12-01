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

</script>

<ul>
    {#each dateSortedPosts as { path, metadata: { title, tags, date } }}
    <li>
        <h3><a href={`/blog/${path.replace(".md", "")}`}>{title}</a></h3>
        {#each tags as tag}
        <span class="tag">
            <a href={`/tags/${tag}`}>#{tag}</a>&nbsp;
        </span>
        {/each}
        <span class="date">{new Date(date).toLocaleDateString()}</span>
    </li>
    {/each}
</ul>

<style lang="scss">
    ul {
        list-style: none;
        padding-left: 0;
        li {
            h3 {
                margin-bottom: 0;
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
                a:hover {
                    opacity: 0.5;
                }
            }
        }
    }

    .date {
        opacity: 0.5;
        font-size: 1rem;
    }
</style>

