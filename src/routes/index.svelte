<script>

import { HtmlTagHydration } from "svelte/internal";

</script>

<h2 style="font-weight: normal;">hi! I might blog here about about beginner web development (I'm a noob). I also study medicine. Welcome to my online hub.</h2>

<h2>Projects</h2>
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

<style lang="scss">
    :global(.dark) {
        .project {
            border: white 2px solid;
            h3 {
                color: #111344;
            }
            div {
                background: white;
            }
        }
    }

    a {
        color: inherit;
        text-decoration: none;
        opacity: 0.5;
        &:hover{
            text-decoration: underline;
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
</style>