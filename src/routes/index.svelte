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
    import Contact from '$lib/Contact.svelte'

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
            src: '/projects/calculator', 
            description: 'Making this in SvelteKit was a breeze. My Python version stranded due the price of Flask hosting.', 
            img:"illustration-shapes.svg",
            outside: false
        },
	];

    import Art from '$lib/Art.svelte'

</script>

<Seo {pageTitle} {metaDescription}/>

<div class="container">
<div class="grid2">
    <div class="grid2-blog">
        <h1 id="blog" class="header">Recently published</h1>
            <div class="blog-parent">
                {#each dateSortedPosts.slice(0, 4) as { path, metadata: { title, snippet, date } }}
                    <a class="divlink" href={`${path.replace(".md", "")}`}>
                    <div class="blogPost">
                        <h3 id="blogPostHeader">{title}</h3>
                        <p>{snippet}</p>
                        <span class="date">{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    </a>
                {/each}
                <a href="/blog" class="divlink">
                    <div class="allPostButton blogPost ">
                        <h3 id="allpostHeader">All posts</h3>
                    </div>
                </a>
            </div>               
    </div> 

    <div class="grid2-tags">
        <div>
            <h1 id="tags" class="header">Explore topics</h1>
            <TagCloud/>
        </div>  
        <div>
            <h1 class="header" id="about" >About</h1>
            <div class="about">
                <p>Hey, I'm Koen👋</p>
                <p>I'm a medicine student who likes to mess around with web design and a little data science.</p>
                <p>I'm thrilled you're visiting!
            </div>
        </div>      
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
                animation-delay: 250ms;
                animation-fill-mode: both;
            }
            a:nth-child(2){
                animation: appear 500ms;
                animation-delay: 500ms;
                animation-fill-mode: both;
            }
            a:nth-child(3){
                animation: appear 500ms;
                animation-delay: 750ms;
                animation-fill-mode: both;
            }
        }
    }

    .grid1, .grid2, .grid3 {
        display: grid;
        grid-template-columns: 1fr;
        grid-gap: calc(var(--spacing-unit) * 1.5);
        align-content: stretch;
        justify-content: stretch;
        margin: calc(var(--spacing-unit) * 0.5);
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
                margin: calc(var(--spacing-unit) * 5) 0 0 calc(var(--spacing-unit) * 4);
                grid-column: 1/2;
                grid-row: 1/2;
                text-align: left;
            }
        }
    }

    .grid1 {
        padding: calc(var(--spacing-unit) * 2) 0 0;
        @media screen and (min-width: 1200px) {
            margin: 0 0 calc(var(--spacing-unit)*3);
        }
    }

    .grid2 {
        margin-top: calc(var(--spacing-unit) * 6);
        grid-gap: calc(var(--spacing-unit) * 3);
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
        background: var(--gray-450);
        border-radius: var(--corner-unit);
        position: relative;
        box-shadow: var(--shadow-elevation-low);
        padding: calc(1.25* var(--spacing-unit));
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
                .allPostButton {
                    background: linear-gradient(101deg, #00ffee 10%, #8ee6c8 20%, #bacda2 30%, #d6b37e 40%, #e9975a 56%, #f67835 73%, #ff5100 90%);
                }
                .blogPost {                        
                    #blogPostHeader {
                        color: var(--primary-300);
                    }
                    transform: scale(1.005);
                    transition: var(--transition-time) ease;
                    box-shadow: var(--shadow-elevation-medium);
                }

            }
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

    .allPostButton {
        text-align: center;
        background: linear-gradient(101deg, #00ffee 0%, #8ee6c8 16%, #bacda2 33%, #d6b37e 50%, #e9975a 66%, #f67835 83%, #ff5100 100%);
        transition: all 0.2s ease;
        color: var(--primary-100);
        justify-self: start;
        align-self: start;
        h3 {
            &:hover {
                color: var(--primary-100);
            }
            margin: 0;
            padding: 0;
            text-decoration: none;
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
    background: #ABEDE9;
    background: -webkit-radial-gradient(right, #ABEDE9, #EBFFFE);
    background: -moz-radial-gradient(right, #ABEDE9, #EBFFFE);
    background: radial-gradient(to left, #ABEDE9, #EBFFFE);
}
.hero-background {
    background: transparent;
    background-size: cover;
    position: relative;
    width: 105vw;
    position: relative;
    left: 50%;
    right: 50%;
    margin-left: -52.5vw;
    margin-right: -52.5vw;
    margin-top: calc(var(--spacing-unit) * 2);
    margin-bottom: calc(var(--spacing-unit) * 2);
    padding-bottom: var(--spacing-unit);

}

.container {
      max-width: 1300px;
      @media screen and (max-width: 600px) {
          max-width: 100vw;
      }
      margin: auto;
      position: relative;
    }

.header {
    font-size: 1.8em;
    margin-left: 0;
    margin-bottom: var(--spacing-unit);
}

#projects {
    @media screen and (min-width: 600px) {
        margin-left: var(--spacing-unit);
    }
}

// BUTTONS 
.button {
    color: inherit;
    display: inline-block;
    font-size: 1.2em;
    padding: 0.5rem 0.85rem 0.5rem;
    margin: var(--spacing-unit) var(--spacing-unit) 0rem;
    border-radius: calc(var(--corner-unit));
    background: transparent;
    text-decoration: none;
    font-weight: 600;
    @media screen and (max-width: 500px) {
        margin: var(--spacing-unit) calc(var(--spacing-unit) * 0.75) 0rem
    }

}

.scale-background-on-hover {
                position: relative;
                }

                .scale-background-on-hover::after {
                background-color: var(--primary-500);
                box-shadow: var(--shadow-elevation-low);
                
                border-radius: var(--corner-unit);
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: -1;
                transition: transform 250ms;
                }
                .scale-background-on-hover:hover::after {
                transform: scale(1.05);
                box-shadow: var(--shadow-elevation-medium);
                }

.mailbutton {
    position: absolute;
    top: 0;
    transform: translate(0,-2.5rem);
    right: 0;
    box-shadow: var(--shadow-elevation-medium);
    &:hover {
        box-shadow: var(--shadow-elevation-mediumhigh);
        background: rgb(239,245,245);
        background: linear-gradient(0deg, rgba(239,245,245,1) 0%, rgba(255,255,255,1) 1%);
        color: inherit;
        transition: 0.2s ease-in-out;
    }
}

.about {
    max-width: 15rem;
    a {
        position: relative;
        color: var(--secondary-300);
        font-weight: 500;
        text-decoration: none;
        &:before {
            content: '';
            z-index: 10;
            display: block;
            position: absolute;
            bottom: -0.1em;
            left: 0em;
            width: 100%;
            height: 0.1em;
            background: var(--secondary-300);
        }
        &:hover:before{
            display: block;
        }
    }
}

</style>