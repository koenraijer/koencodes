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
                            <a class="button blogbutton" href="#blogposts">Blog</a>
                            <a class="button projectsbutton" href="#projects">Projects</a>
                        </nav>
                    </div>
                </div>
            </div>    
        </div>
    </div>
    <svg id="visual" viewBox="0 24 150 28" width="1440" height="250" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
        <defs>
            <linearGradient id="gradient400" x1="0" x2="1" y1="0" y2="1">
                <stop offset="100%" style="stop-color:var(--primary-400);stop-opacity: 1;"/>
                <stop offset="0%" style="stop-color:var(--primary-400);stop-opacity: 0;"/>
              </linearGradient>
              <linearGradient id="gradient300" x1="0" x2="1" y1="0" y2="1">
                <stop offset="100%" style="stop-color:var(--primary-375);stop-opacity: 1;"/>
                <stop offset="0%" style="stop-color:var(--primary-375);stop-opacity: 0;"/>
              </linearGradient>
              <linearGradient id="gradient3" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stop-color="var(--primary-400)"/>
                <stop offset="100%" stop-color="var(--primary-400-transp"/>
              </linearGradient>
        </defs>
            <path fill="url(#gradient400)" id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"></path>
            <path fill="url(#gradient300)"  id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"></path>
            <path fill="var(--primary-375-transp)" id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"></path>
            <path fill="url(#gradient400)" id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"></path>
            <path fill="var(--primary-375-transp)" id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"></path>
            <path fill="url(#gradient300)"  id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"></path>
            <path fill="url(#gradient400)" id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"></path>
    </svg>
</div>


<div class="container">
<div class="grid2">
    <div class="grid2-blog">
        <h1 id="blogposts" class="header">Recently published</h1>
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
        <h2 id="tags" class="header">Explore topics</h2>
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
        h2 {
            animation: appear 500ms;
            animation-delay: 100ms;
            animation-fill-mode: both;
        }
        h1 {
            animation: appear 500ms;
            animation-delay: 500ms;
            animation-fill-mode: both;
        }
       
        h3 {
            animation: appear 500ms;
            animation-delay: 1000ms;
            animation-fill-mode: both;
        }

        nav {
            a:first-child{
                animation: appear 500ms;
                animation-delay: 1500ms;
                animation-fill-mode: both;
            }
            a:nth-child(2){
                animation: appear 500ms;
                animation-delay: 1750ms;
                animation-fill-mode: both;
            }
        }
    }
    // ------------------

    // WAVES ANIMATIONS
   
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

    .grid1, .grid2, .grid3 {
        display: grid;
        grid-template-columns: 1fr;
        grid-gap: 1.5rem;
        align-content: stretch;
        justify-content: stretch;
        margin: var(--spacing-unit);
    }

    .grid1, .grid2 {
        .grid1-hero {
            display: grid;
            align-items: center;
            text-align: center;
            h1 {
                font-weight: 600;
            }
            h2 {
                font-weight: 600;
                color: var(--gray-100);
            }
            h3, h4 {
                margin: 0;
                color: var(--gray-100);
                font-weight: normal;
            }
            margin: calc(var(--spacing-unit) * -3.5) var(--spacing-unit) var(--spacing-unit);
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
                .viewport-toggle {
                    display: block;
                }
                margin: calc(var(--spacing-unit) * 5) var(--spacing-unit) var(--spacing-unit);
                grid-column: 1/2;
                grid-row: 1/2;
                text-align: left;
            }
        }
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
                    transition: 0.1s ease;
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
    margin-left: -50vw;
    margin-right: -50vw;
    margin-bottom: 0rem;
    position: relative;
    svg {
        transform: rotate(180deg) translateY(4rem);
        path:nth-child(8) {
            transform: translateY(8rem);
        }
        width: 100vw;
        height: auto;
        position: relative;
        z-index: -1;
        @media screen and (max-width: 600px) {
            transform: rotate(180deg) translateY(0rem);
        }
        @media screen and (max-width: 900px) {
            transform: rotate(180deg) translateY(2rem);
        }
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
    &:before {
        content: '';
        background: var(--primary-400);
        position: absolute;
        z-index: -1;
        top: -50vh;
        left: 0;
        height: 50vh;
        width: 100vw;
    }
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
      margin: auto;
    }

.header {
    margin-left: var(--spacing-unit);
}

#blogposts {
    @media screen and (min-width: 900px) {
        margin-left: -0.5rem;
    }
}
#tags {
    margin-left: 0;
}

// BUTTONS 
.button {
    color: inherit;
    display: inline-block;
    font-size: 1.2em;
    padding: 0.5rem 0.85rem 0.5rem;
    margin: var(--spacing-unit) var(--spacing-unit) 0rem;
    border-radius: calc(var(--corner-unit) * 2);
    background: var(--primary-400);
    box-shadow: var(--shadow-elevation-medium);
    text-decoration: none;
    font-weight: 600;
    &:hover {
        background: var(--primary-300);
        box-shadow: var(--shadow-elevation-mediumhigh);
        color: white;
    }
    @media screen and (max-width: 500px) {
        font-size: 1em;
        margin: var(--spacing-unit) calc(var(--spacing-unit) * 0.5) 0rem
    }

}


.projectsbutton {
    background: var(--primary-300);
    color: white;
    &:hover {
        background: var(--primary-350);
        transform: translate(-0.05rem, -0.05rem);
        transition: 0.2s ease-in-out;
    }
}

.blogbutton {
    background: var(--secondary-350);
    color: white;
    &:hover {
        background: var(--secondary-300);
        transform: translate(-0.05rem, -0.05rem);
        transition: 0.2s ease-in-out;
    }
}

</style>