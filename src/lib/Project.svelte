<script>
    export let title = "a project";
    export let src = "/";
    export let description = "a project about something.";
</script>

<main>
    <div class="project">
        <div><h3><a target="_blank" rel="noopener" href="{src}">{title}</a></h3></div>
        <p>{@html description}</p>
    </div>
</main>

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

    p :global(a) {
                color: #06D6A0;
                text-decoration: none;
                &:hover{
                text-decoration: underline;
                }
            }
    
    p {
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
</style>