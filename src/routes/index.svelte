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
                        <h1>I do some programming in my <span><br></span>off-time.</h1>
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
    <svg transform="scale(2)" id="visual" viewBox="0 0 1440 250" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"><path d="M0 133L26.7 128.7C53.3 124.3 106.7 115.7 160 105.8C213.3 96 266.7 85 320 85C373.3 85 426.7 96 480 107.5C533.3 119 586.7 131 640 133.7C693.3 136.3 746.7 129.7 800 121.8C853.3 114 906.7 105 960 101.7C1013.3 98.3 1066.7 100.7 1120 93.7C1173.3 86.7 1226.7 70.3 1280 72C1333.3 73.7 1386.7 93.3 1413.3 103.2L1440 113L1440 0L1413.3 0C1386.7 0 1333.3 0 1280 0C1226.7 0 1173.3 0 1120 0C1066.7 0 1013.3 0 960 0C906.7 0 853.3 0 800 0C746.7 0 693.3 0 640 0C586.7 0 533.3 0 480 0C426.7 0 373.3 0 320 0C266.7 0 213.3 0 160 0C106.7 0 53.3 0 26.7 0L0 0Z" fill="#53c6be"></path><path d="M0 54L26.7 65.3C53.3 76.7 106.7 99.3 160 97.3C213.3 95.3 266.7 68.7 320 54.5C373.3 40.3 426.7 38.7 480 44.3C533.3 50 586.7 63 640 74.7C693.3 86.3 746.7 96.7 800 90.2C853.3 83.7 906.7 60.3 960 59.7C1013.3 59 1066.7 81 1120 84.8C1173.3 88.7 1226.7 74.3 1280 68.5C1333.3 62.7 1386.7 65.3 1413.3 66.7L1440 68L1440 0L1413.3 0C1386.7 0 1333.3 0 1280 0C1226.7 0 1173.3 0 1120 0C1066.7 0 1013.3 0 960 0C906.7 0 853.3 0 800 0C746.7 0 693.3 0 640 0C586.7 0 533.3 0 480 0C426.7 0 373.3 0 320 0C266.7 0 213.3 0 160 0C106.7 0 53.3 0 26.7 0L0 0Z" fill="#49c7bc"></path><path d="M0 80L26.7 84C53.3 88 106.7 96 160 92.8C213.3 89.7 266.7 75.3 320 68.7C373.3 62 426.7 63 480 71.3C533.3 79.7 586.7 95.3 640 91C693.3 86.7 746.7 62.3 800 52.7C853.3 43 906.7 48 960 58C1013.3 68 1066.7 83 1120 89.3C1173.3 95.7 1226.7 93.3 1280 83C1333.3 72.7 1386.7 54.3 1413.3 45.2L1440 36L1440 0L1413.3 0C1386.7 0 1333.3 0 1280 0C1226.7 0 1173.3 0 1120 0C1066.7 0 1013.3 0 960 0C906.7 0 853.3 0 800 0C746.7 0 693.3 0 640 0C586.7 0 533.3 0 480 0C426.7 0 373.3 0 320 0C266.7 0 213.3 0 160 0C106.7 0 53.3 0 26.7 0L0 0Z" fill="#6cd0c8"></path><path d="M0 27L26.7 33.8C53.3 40.7 106.7 54.3 160 63.3C213.3 72.3 266.7 76.7 320 71.3C373.3 66 426.7 51 480 49C533.3 47 586.7 58 640 56.8C693.3 55.7 746.7 42.3 800 35.2C853.3 28 906.7 27 960 29.3C1013.3 31.7 1066.7 37.3 1120 47.8C1173.3 58.3 1226.7 73.7 1280 81C1333.3 88.3 1386.7 87.7 1413.3 87.3L1440 87L1440 0L1413.3 0C1386.7 0 1333.3 0 1280 0C1226.7 0 1173.3 0 1120 0C1066.7 0 1013.3 0 960 0C906.7 0 853.3 0 800 0C746.7 0 693.3 0 640 0C586.7 0 533.3 0 480 0C426.7 0 373.3 0 320 0C266.7 0 213.3 0 160 0C106.7 0 53.3 0 26.7 0L0 0Z" fill="#8adad4"></path><path d="M0 21L26.7 21.3C53.3 21.7 106.7 22.3 160 25.8C213.3 29.3 266.7 35.7 320 34.8C373.3 34 426.7 26 480 23.2C533.3 20.3 586.7 22.7 640 26.3C693.3 30 746.7 35 800 40.3C853.3 45.7 906.7 51.3 960 51.2C1013.3 51 1066.7 45 1120 42.5C1173.3 40 1226.7 41 1280 42C1333.3 43 1386.7 44 1413.3 44.5L1440 45L1440 0L1413.3 0C1386.7 0 1333.3 0 1280 0C1226.7 0 1173.3 0 1120 0C1066.7 0 1013.3 0 960 0C906.7 0 853.3 0 800 0C746.7 0 693.3 0 640 0C586.7 0 533.3 0 480 0C426.7 0 373.3 0 320 0C266.7 0 213.3 0 160 0C106.7 0 53.3 0 26.7 0L0 0Z" fill="#a5e4df"></path><path d="M0 29L26.7 31.5C53.3 34 106.7 39 160 35.3C213.3 31.7 266.7 19.3 320 15.5C373.3 11.7 426.7 16.3 480 17.2C533.3 18 586.7 15 640 13.8C693.3 12.7 746.7 13.3 800 16C853.3 18.7 906.7 23.3 960 28.8C1013.3 34.3 1066.7 40.7 1120 38.5C1173.3 36.3 1226.7 25.7 1280 20.8C1333.3 16 1386.7 17 1413.3 17.5L1440 18L1440 0L1413.3 0C1386.7 0 1333.3 0 1280 0C1226.7 0 1173.3 0 1120 0C1066.7 0 1013.3 0 960 0C906.7 0 853.3 0 800 0C746.7 0 693.3 0 640 0C586.7 0 533.3 0 480 0C426.7 0 373.3 0 320 0C266.7 0 213.3 0 160 0C106.7 0 53.3 0 26.7 0L0 0Z" fill="#c0edea"></path><path d="M0 11L26.7 10.5C53.3 10 106.7 9 160 11.3C213.3 13.7 266.7 19.3 320 20.7C373.3 22 426.7 19 480 15C533.3 11 586.7 6 640 9.2C693.3 12.3 746.7 23.7 800 27.7C853.3 31.7 906.7 28.3 960 24.3C1013.3 20.3 1066.7 15.7 1120 16C1173.3 16.3 1226.7 21.7 1280 19.8C1333.3 18 1386.7 9 1413.3 4.5L1440 0L1440 0L1413.3 0C1386.7 0 1333.3 0 1280 0C1226.7 0 1173.3 0 1120 0C1066.7 0 1013.3 0 960 0C906.7 0 853.3 0 800 0C746.7 0 693.3 0 640 0C586.7 0 533.3 0 480 0C426.7 0 373.3 0 320 0C266.7 0 213.3 0 160 0C106.7 0 53.3 0 26.7 0L0 0Z" fill="#d9f7f5"></path></svg>
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

    .grid1-art {
        animation: appear 500ms;
        animation-delay: 2400ms;
        animation-fill-mode: both;
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
                span {
                    display: inline;
                    @media screen and (max-width: 700px) {
                        display: none;
                    }
                }
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
        @media screen and (min-width: 1200px) {
            margin: calc(var(--spacing-unit) * 3) 0 calc(var(--spacing-unit));
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
      @media screen and (max-width: 600px) {
          max-width: 100vw;
      }
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
        transform: translate(-0.05rem, -0.05rem);
        transition: 0.2s ease-in-out;
    }
}

.blogbutton {
    background: var(--primary-300);
    color: white;
    &:hover {
        background: var(--primary-350);
        transform: translate(-0.05rem, -0.05rem);
        transition: 0.2s ease-in-out;
        color: var(--primary-100);
    }
}

</style>