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
    import TagCloud from '$lib/TagCloud.svelte'

    let pageTitle = "home"
    let metaDescription = "The homepage: a collection of projects and blog posts."
    
    export let posts;

    const dateSortedPosts = posts.slice().sort((post1, post2) => {
        return new Date(post2.metadata.date) - new Date(post1.metadata.date);
    });

    import Project from '$lib/Project.svelte'

    let projects = [
		{   title: 'My charity website <span><img class="svg-icon" src="link.svg"></span>', 
            src: 'https://www.vriendenvoorkika.nl/', 
            description: 'Climbing a mountain for charity. Made a website for it using Jekyll and Netlify. Consider <a target="_blank" rel="noopener" href="https://www.actievoorkika.nl/sanne-koen-thomas-en-romy">donating</a>!', 
            img:"illustration-crosses.svg",
            outside: true
        },
		{   title: 'This blog', 
            src: '/', 
            description: 'Maxed out Jekyll, and felt overwhelmed by React. In comes SvelteKit!', 
            img:"illustration-3scribbles.svg",
            outside: false
        },
        {   title: 'An investing calculator', 
            src: '/calculator', 
            description: 'Making this in SvelteKit was a breeze. My Python version stranded due the price of Flask hosting.', 
            img:"illustration-shapes.svg",
            outside: false
        },
	];

    import Art from '$lib/Art.svelte'

</script>

<Seo {pageTitle} {metaDescription}/>
<div class="wrapperForHero">
    <div class="hero-background">
        <div class="container">
            <div class="grid1">
                <div class="grid1-art">
                    <Art />
                </div>
                <div class="grid1-hero">
                    <div>
                        <h2>Hi, I'm Koen!</h2>
                        <h1>I do some programming in my <br>off-time.</h1>
                        <h3>I write about web development as if you know nothing, because neither do I!</h3>
                        <nav>
                            <a class="button blogbutton" href="#blog">Blog</a>
                            <a class="button projectsbutton" href="#projects">Projects</a>
                        </nav>
                    </div>
                </div>
            </div>    
        </div>
    </div>
</div>


<div class="container">
<div class="grid2">
    <div class="grid2-blog">
        <h1 id="blog" class="header">Recently published</h1>
            <div class="blog-parent">
                {#each posts.slice(0, 4) as { path, metadata: { title, snippet, date } }}
                    <a class="divlink" href={`${path.replace(".md", "")}`}>
                    <div class="blogPost">
                        <h3>{title}</h3>
                        <p>{snippet}</p>
                        <span class="date">{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    </a>
                {/each}
                <a href="/blog" class="divlink">
                    <div class="blogPost allPostButton">
                        <h4>All posts &#10132;</h4>
                    </div>
                </a>
            </div>               
    </div> 

    <div class="grid2-tags">
        <h1 id="tags" class="header">Explore topics</h1>
        <TagCloud/>
        
    </div>  
</div>
    
<h1 id="projects" class="header">Projects</h1>
<div class="grid3">
    {#each projects as { title, src, description, img, outside }}
        <Project {title} {src} {description} {img} {outside}/>
    {/each}
</div>


</div>
<style lang="scss">
    // HERO ANIMATIONS
    @keyframes appear {
        0% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }
    .grid1-hero {
        nav {
            a:first-child{
                animation: appear 500ms;
                animation-delay: 500ms;
                animation-fill-mode: both;
            }
            a:nth-child(2){
                animation: appear 500ms;
                animation-delay: 750ms;
                animation-fill-mode: both;
            }
        }
    }
    // ------------------

    // WAVES ANIMATIONS
   /*
    @keyframes horizontal-move-fade {
        0% {
            transform: translateX(var(--offset));
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
        100% {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    @keyframes horizontal-move-no-fade {
        0% {
            transform: translateX(var(--offset));
            opacity: 1;
        }
        100% {
            transform: translateX(100%);
        }
    }

    .wrapperForHero{
        svg {
            path:nth-child(1) {
                --offset: -100%;
                --duration: 30s;
            }
            path:nth-child(2) {
                --offset: -75%;
                --duration: 29s;
            }
            path:nth-child(3) {
                --offset: 0%;
                --duration: 43s;
            }
            path:nth-child(4) {
                --offset: 25%;
                --duration: 40s;
            }
            path:nth-child(5) {
                --offset: 50%;
                --duration: 46s;
            }
            path:nth-child(6) {
                --offset: 75%;
                --duration: 45s;
                animation: horizontal-move-no-fade var(--duration) infinite linear;
            }
            path:nth-child(7) {
                --offset: 90%;
                --duration: 50s;
            }
            path:nth-child(7) {
                --offset: 60%;
                --duration: 80s;
                animation: horizontal-move-no-fade var(--duration) infinite linear;
            }
            path:nth-child(8) {
                --offset: 50%;
                --duration: 75s;
                animation: horizontal-move-no-fade var(--duration) infinite linear;
            }
            path {
                animation: horizontal-move-fade var(--duration) infinite linear;
                animation-fill-mode: both;
            }
        }
    }
    */
    .grid1, .grid2, .grid3 {
        display: grid;
        grid-template-columns: 1fr;
        grid-gap: 1.5rem;
        align-content: stretch;
        justify-content: stretch;
        margin: 0;
        @media screen and (min-width: 600px) {
            margin: var(--spacing-unit);
        }
    }

    .grid1, .grid2 {
        .grid1-hero {
            display: grid;
            align-items: center;
            text-align: center;
            justify-items: start;
            h1 {
                font-weight: 600;
                @media screen and (max-width: 600px) {
                    font-size: 1.8rem;
                }
                margin: 0;
            }
            h2 {
                font-weight: 500;
                color: var(--gray-100);
                margin: 0;
            }
            h3, h4 {
                margin: 0;
                color: var(--gray-100);
                font-weight: normal;
            }

            grid-column: 1/2;
            grid-row: 2/3;
            nav {
                float: none;
                @media screen and (min-width: 1200px) {
                    float: right;
                }
            }
        }
        .grid1-art {
            display: grid;
            place-items: center;
        }
        @media screen and (min-width: 1200px) {
            grid-template-columns: 2fr 1fr;
            .grid1-hero {
                margin: calc(var(--spacing-unit) * 2) 0 0 calc(var(--spacing-unit) * 2);
                grid-column: 1/2;
                grid-row: 1/2;
                text-align: left;
            }
        }
    }

    .grid1 {
        padding: calc(var(--spacing-unit) * 2) 0 0;
        @media screen and (min-width: 1200px) {
            margin: calc(var(--spacing-unit) * 1) 0 calc(var(--spacing-unit)*3);
        }
    }

    .grid2 {
        margin-top: calc(var(--spacing-unit) * 2);
    }
    .grid3 {
        @media screen and (min-width: 800px) {
            grid-template-columns: 1fr 1fr;
        }
        @media screen and (min-width: 1100px) {
            grid-template-columns: 1fr 1fr 1fr;
        }
    }

    
    // BLOG POSTS
    .blogPost {
        overflow: hidden;
        border-radius: var(--corner-unit);
        position: relative;
        box-shadow: var(--shadow-elevation-medium);
        padding: var(--spacing-unit);
        p {
            padding: 0;
            margin: 0 0 var(--spacing-unit);
        }
        h3 {
            padding: 0;
            margin: var(--spacing-unit) 0 var(--spacing-unit);
        }
        .date {
            opacity: 0.5;
            font-size: 0.9rem;
        }
    }

    .divlink {
    height: 100%;
    text-decoration: none;
    color: inherit;
        &:hover {
            &:hover {
                h3 {
                    color: var(--primary-300);
                }
                .blogPost {
                    transform: translate(-0.05rem, -0.05rem);
                    transition: var(--transition-time) ease;
                    box-shadow: var(--shadow-elevation-mediumhigh);
                }
                .allPostButton {
                    background: var(--primary-300);
                }
            }
        }
    }

    .allPostButton {
        background: var(--primary-200);
        justify-self: start;
        align-self: start;
        h4 {
            margin: 0;
            padding: 0;
            color: white;
            text-decoration: none;
        }
    }

    .grid2-tags {
        position: relative;
        margin-bottom: var(--spacing-unit);
    }

    /***********************/

    .blog-parent {
        display: grid;
        grid-gap: 1.5rem;
        justify-content: stretch;
        align-content: stretch;
        grid-template-columns: 1fr;
        margin-bottom: calc(var(--spacing-unit) * 2);
        @media screen and (min-width: 900px) {
            grid-template-columns: 1fr 1fr;
            a:first-child {
                grid-row: 1 / 2;
                grid-column: 1 / 3;
            }
        }
    }

// BACKGROUNDS
.full-bleed {
    width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}

.wrapperForHero {
    width: 100vw;
    left: 50%;
    right: 50%;
    margin: 0 -50vw 0 -50vw;
    position: relative;
    svg {
        width: 100vw;
        height: auto;
        position: relative;
        z-index: -1;
    }
}
.hero-background {
    background: var(--primary-400);
    position: relative;
    width: 100vw;
    position: relative;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
    padding-bottom: var(--spacing-unit);

}

.blobs {
    position: absolute;
    z-index: -1;
}

.blob1 {
        top: 0;
        left: 10rem;
        height: 10rem;
        transform: translate(8rem, 0);
        @media screen and (min-width: 900px ) {
            transform: translate(-5rem, 15rem);
        }
    }

.container {
      max-width: 1300px;
      @media screen and (max-width: 600px) {
          max-width: 100vw;
      }
      margin: auto;
    }

.header {
    margin-left: var(--spacing-unit);
    margin-bottom: var(--spacing-unit);
}

// BUTTONS 
.button {
    color: inherit;
    display: inline-block;
    font-size: 1.2em;
    padding: 0.5rem 0.85rem 0.5rem;
    margin: var(--spacing-unit) var(--spacing-unit) 0rem;
    border-radius: calc(var(--corner-unit));
    background: var(--primary-400);
    box-shadow: var(--shadow-elevation-mediumhigh);
    text-decoration: none;
    font-weight: 600;
    &:hover {
        background: var(--primary-300);
        box-shadow: var(--shadow-elevation-high);
        color: white;
    }
    @media screen and (max-width: 500px) {
        margin: var(--spacing-unit) calc(var(--spacing-unit) * 0.75) 0rem
    }

}


.projectsbutton {
    color: white;
    background: var(--secondary-300);
    &:hover {
        background: var(--secondary-350);
        color: inherit;
        transform: translate(-0.1rem, -0.1rem);
        transition: 0.2s ease-in-out;
    }
}

.blogbutton {
    background: var(--primary-300);
    color: white;
    &:hover {
        background: var(--primary-350);
        transform: translate(-0.1rem, -0.1rem);
        transition: 0.2s ease-in-out;
        color: var(--primary-100);
    }
}

</style>