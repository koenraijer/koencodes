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
    import Seo from '$lib/Seo.svelte';
    import Posts from '$lib/Posts.svelte';

    export let posts;

    export const dateSortedPosts = posts.slice().sort((post1, post2) => {
        return new Date(post2.metadata.date) - new Date(post1.metadata.date);
    });

    let pageTitle = "blog"
    let metaDescription = "Collection of all blog posts on the website."
</script>


<Seo {pageTitle}{metaDescription}/>

    <main class="container">
        <div>
            <h1>All posts</h1>
        </div>
        <div class="wrapper">
            <Posts {dateSortedPosts}/> 
            <div class="background"></div>
        </div>
    </main>    

<style lang="scss">
    .container {
      max-width: 1300px;
      margin: auto;
      position: relative;
      padding: 0 var(--spacing-unit) 0;    
      div {
          display: grid;
          align-items: center;
          h1 {
              text-align: center;
          }
      }
    }

    .wrapper {
          margin-top: calc(var(--spacing-unit) * 3);
    }

    .background {
        width: 100vw;
        height: calc(100% + 25rem);
        top: -15rem;
        z-index: -1;
        position: fixed;
        left: 50%;
        right: 50%;
        margin-left: -50vw;
        margin-right: -50vw;
        background: var(--primary-500);
        background-size: cover;
        background-position: center;
    }
</style>

