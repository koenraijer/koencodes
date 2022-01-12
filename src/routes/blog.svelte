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
        <div class="post-hero">
            <h1>All Posts</h1>
        </div>
        <div class="wrapper">
            <Posts {dateSortedPosts}/> 
        </div>
    </main>    

<style lang="scss">
    .container {
      max-width: 1300px;
      margin: auto;
      position: relative;  
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
          margin: calc(var(--spacing-unit) * 3) calc(var(--spacing-unit) * 0.5) 0;
            @media screen and (min-width: 600px) {
                margin: calc(var(--spacing-unit) * 3) var(--spacing-unit) 0;
        }  
    }

    .post-hero {
        padding: calc(var(--spacing-unit) * 4) 0 calc(var(--spacing-unit) * 2);
        display: grid;
        align-items: center;
        position: relative;
    }
</style>

