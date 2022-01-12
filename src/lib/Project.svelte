<script>
    export let title = "a project";
    export let src = "/";
    export let description = "a project about something.";
    export let img = "&#128161";
    export let outside = false;
</script>

    {#if outside === true }
        <a class="divlink"  target="_blank" rel="noopener" href="{src}">
            <div class="project">
                <div>
                    <div>
                        <img alt="simple brushed line decoration" src={img}>
                    </div>
                </div>
                <div>
                    <h3>{@html title}</h3>
                    <p>{@html description}</p>
                </div>
            </div>
            </a>
    {:else} 
        <a class="divlink" href="{src}">
            <div class="project">
                <div>
                    <div>
                        <img alt="simple brushed line decoration" src={img}>
                    </div>
                </div>
                <div>
                    <h3>{@html title}</h3>
                    <p>{@html description}</p>
                </div>
            </div>
            </a>
    {/if}
    
<style lang="scss">

    p :global(a) {
                    position: relative;
                    color: var(--secondary-300);
                    font-weight: 500;
                    text-decoration: none;
                    &:before {
                        z-index: -100;
                        content: '';
                        display: none;
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
    h3 :global(img) {
        display: inline;
        max-height: 0.75rem;
        margin: 0;
        padding: 0;
        transform: translateY(-0.25rem);
        max-width: 1rem;
    }
.divlink {
    text-decoration: none;
    color: inherit;
    &:hover {
        h3 {
            color: var(--primary-300);
            
        }
        .project {
            transform: scale(1.005);
            transition: var(--transition-time) ease;
            box-shadow: var(--shadow-elevation-medium);
        }
    }
}

    .project {
        overflow: hidden;
        border-radius: var(--corner-unit);
        position: relative;
        background: var(--gray-450);
        box-shadow: var(--shadow-elevation-low);
        div:first-child {
            display: grid;
            place-items: center;
            background: var(--gray-400);
            position: relative;
            padding: calc(1.25* var(--spacing-unit));
            div {
                padding: 1rem 0 1rem;
                width: 50%;
                max-height: 5rem;
                img {
                    max-height: 5rem;
                }
            }
        }

        div:nth-child(2) {
            padding: calc(1.25* var(--spacing-unit));
            p {
            padding: 0;
            margin: 0;
            }
            h3 {
                padding: 0;
                margin: var(--spacing-unit) 0 var(--spacing-unit);
            }
        }
    }
</style>