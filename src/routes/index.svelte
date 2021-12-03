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
    import Seo from '$lib/Seo.svelte'

    let pageTitle = "home"
    let metaDescription = "The homepage: a collection of projects and blog posts."
    
    export let posts;

    const dateSortedPosts = posts.slice().sort((post1, post2) => {
        return new Date(post2.metadata.date) - new Date(post1.metadata.date);
    });
</script>

<Seo {pageTitle} {metaDescription}/>

<h2 style="font-weight: normal;">hi! I might blog here about about beginner web development (I'm a noob). I also study medicine. Welcome to my online hub.</h2>

<h2 id="projects">Projects</h2>
<div class="project-parent">
    <div class="project">
        <div><h3><a href="https://www.vriendenvoorkika.nl/">my charity website</a></h3></div>
        <p>Climbing a mountain for charity. Made a <a href="https://www.vriendenvoorkika.nl/">website</a> for it using Jekyll and Netlify. Consider <a href="https://www.actievoorkika.nl/sanne-koen-thomas-en-romy">donating</a>!</p>
    </div>
    
    <div class="project">
        <div><h3>this blog</h3></div>
        <p>Maxed out Jekyll, and felt overwhelmed by React. In comes SvelteKit!</p>
    </div>  
    
    <div class="project">
        <div><h3><a href="/calculator">an investing calculator</a></h3></div>
        <p>Making this in SvelteKit was a breeze. My Python version stranded due the price of Flask hosting.</p>
    </div>

    <div class="project">
        <div><h3><a href="/flowcharts/schildklier">interactive diagnostic flowchart</a></h3></div>
        <p>Quick and dirty way to diagnose thyroid problems. Adapted from a flowchart by the NHG (Dutch GP association).</p>
    </div>
</div>

<div class="blog">
    <h2 id="blogposts">Latest posts</h2>

    {#each posts.slice(0, 4) as { path, metadata: { title, tags, date } }}
        <h3><a href={`${path.replace(".md", "")}`}>{title}</a></h3>
        <span class="date">{new Date(date).toLocaleDateString()}</span>
        {#each tags as tag}
        <span class="tag">
            <a href={`/tags/${tag}`}>#{tag}</a>&nbsp;
        </span>
        {/each}
    <hr>
    {/each}
    <span style="float: right;"><a href="/blog">all posts &#10132;</a></span>
</div>



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

        p, span {
            a {
            color: #06D6A0;
            text-decoration: none;
            &:hover{
                text-decoration: underline;
            }
            }
        }    

h3 {
    a {
                    color: inherit;
                    text-decoration: none;
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
                    color: #06D6A0;
                }
            }

            p, span {
            a {
            color: #06D6A0;
            text-decoration: none;
            &:hover{
                text-decoration: underline;
            }
            }
        }   
    }

    .date {
        opacity: 0.5;
        font-size: 1rem;
    }

</style>