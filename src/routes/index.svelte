<script context="module">

const allPosts = import.meta.glob("./blog/*.md");

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

    import { HtmlTagHydration } from "svelte/internal";

    export let posts;

    const dateSortedPosts = posts.slice().sort((post1, post2) => {
        return new Date(post2.metadata.date) - new Date(post1.metadata.date);
    });
</script>

<h2 style="font-weight: normal;">hi! I might blog here about about beginner web development (I'm a noob). I also study medicine. Welcome to my online hub.</h2>

<h2 id="projects">Projects</h2>
<div class="project-parent">
    <div class="project">
        <div><h3>vriendenvoorkika</h3></div>
        <p>Climbing a mountain for charity, and made a <a href="https://www.vriendenvoorkika.nl/">website</a> for it using Jekyll and Netlify. Consider <a href="https://www.actievoorkika.nl/sanne-koen-thomas-en-romy">donating</a>.</p>
    </div>
    
    <div class="project">
        <div><h3>this blog</h3></div>
        <p>I feel like I had maxed out Jekyll, but I felt overwhelmed at the thought of learning React. In comes SvelteKit!</p>
    </div>    
</div>

<h2 id="blogposts">Latest posts</h2>

<ul>
    {#each posts as { path, metadata: { title, tags, date } }}
    <li>
        <h3><a href={`${path.replace(".md", "")}`}>{title}</a></h3>
        {#each tags as tag}
        <span class="tag">
            <a href={`/tags/${tag}`}>#{tag}</a>&nbsp;
        </span>
        {/each}
        <span class="date">{new Date(date).toLocaleDateString()}</span>
    </li>
    <hr>
    {/each}
</ul>


<style lang="scss">
    :global(.dark) {
        .project {
            border: white 2px solid;
            box-shadow: 0 0 5px white;
            h3 {
                color: #111344;
            }
            div {
                background: white;
            }
        }
    }
    p {
        a {
        color: inherit;
        text-decoration: none;
        opacity: 0.5;
        &:hover{
            text-decoration: underline;
        }
    }
    }
   

    .project-parent {
        display: grid;
        grid-gap: 1rem;
        @media screen and (min-width: 600px) {
            grid-template-columns: 1fr 1fr;
        }
    }
    .project {
        border: #111344 2px solid;
        box-shadow: 0 0 5px #111344;
        padding: 0.5rem;
        p {
            padding: 0.5rem 0 0;
            margin: 0;
        }
        h3 {
            padding: 0;
            padding-left: 0.5rem;
            margin: 0;
            font-weight: normal;
            color: white;
        }
        div {
            width: calc(100% + 1rem);
            margin: -0.5rem -0.5rem 0;
            padding: 0.25rem 0 0.25rem;
            background: #111344;
        }
    }

    #projects, #blogposts {
        margin-left: -0.5rem;
        @media screen and (min-width: 600px) {
        margin-left: -1rem;
      }
    }

    /***********************/

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