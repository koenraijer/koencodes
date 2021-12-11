---
title: 'MDsveX: styling your markdown files with layouts and highlighting.'
tags: 
    - SvelteKit
    - MDsveX
date: 2021-12-11
snippet: "Use MDsveX layouts and syntax highlighting to style markdown files."
layout: blog
---

## Layouts

If you've ever worked with <a href="https://jekyllrb.com" target="_blank" rel="noopener">Jekyll</a>, you'll probably be familiar already with the way MDsveX layouts work. 
1. Create a layout file with a `<slot>` element where the Markdown comes. 
2. Reference the layout file in the frontmatter of your `.md` file. 

The biggest difference is that you need to tell MDsveX where you have stored your layouts.

A layout is like a special Svelte component that takes Markdown instead of HTML. 

### Creating layout files
First, create a `layouts` folder -- mine is inside of `lib`, and add your first `.svelte` layout to it.

After you declare them, frontmatter variables from `.md` files will be available inside of the layout as props. They can be used just like you normally would.

Add a `<slot></slot>` element to tell MDsveX where to look for Markdown. That's it.

A sample layout:
```html
<script>
    export let title;
    export let snippet;
    export let date;
</script>

<main>
    <h1>{title}</h1>
    <h3>{date}</h3>
    <p>{snippet}</p>
    <article><slot></slot></article>
</main>

<style>
    h1 {
        color: red;
    }
</style>
```


### Telling MDsveX where your layouts are
Inside of `mdsvex.config.js`, or inside the `mdsvex()` function of `svelte.config.js`, add the following:

```js
layout: {
		blog: 'src/lib/layouts/blog.svelte',
        _: 'src/lib/layouts/default.svelte',
	},
```

The `'_'` is the default layout, which will be used if the appointed layout doesn't work. 

### Add your layout to the frontmatter
Just add `layouts: blog` to your frontmatter and you're all set.

```YAML
---
title: Global styles in SvelteKit
tags: 
    - SvelteKit
date: 2021-12-09
snippet: "Shows you how to set up Svelte Preprocess to allow global SCSS variables in your SvelteKit project."
backgroundNumber: 3
layout: blog
---
```
`backgroundNumber` allows me to pick between a couple of illustrations for around the post title. 

## Highlighting

Adding highlighting is a piece of cake since it is an out-of-the-box feature. All you need to do is add a theme. <a href="https://github.com/PrismJS/prism-themes" target="_blank" rel="noopener">This repo</a> has a lot of options.

To add a theme, save the css file and and import it inside of `__layout.svelte` as follows:

```html
<script lang="ts">
    import  "../styles/code.css"
</script>
```

Inside of your Markdown file, code blocks are created by typing three backticks (```) followed immediately by the name of the language (shorthands like 'js' and 'md' work). Then the code. Then again three backticks. 

That's it!