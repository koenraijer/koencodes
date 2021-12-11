---
title: Global styles in SvelteKit
tags: 
    - SvelteKit
date: 2021-12-11
snippet: "Shows you how to set up Svelte Preprocess to allow global SCSS variables in your SvelteKit project."
backgroundNumber: 3
---

Svelte styles are scoped to their components by default, but global styles can be very useful for things like color schemes, dark mode and CSS resets. This article shows you how to install and implement Svelte Preprocess, and then prepend your your `.scss` file full of global styles. It's not difficult to set up! 

To start, create a new folder at `src/lib/` and call it `styles.scss`. Put all of your global styles in there. 

In the terminal, go your project folder and install `svelte-preprocess` and `node-sass`.
```bash
npm install svelte-preprocess node-sass
```

Now go to your `svelte.config.js` file, and import `svelte-preprocess`, `dirname` and `fileURLToPath` like so:

```js
import SveltePreprocess from 'svelte-preprocess';
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
```

Next, we will add two constants which will help us retrieve the path to our `styles.scss` file. 

```js
const filePath = dirname(fileURLToPath(import.meta.url))
const sassPath = `${filePath}/src/styles/`
```

`filePath` retrieves the path to our project folder, by converting `import.meta.url` to a usable string. `sassPath` then specifies the route to where our `styles.scss` file is. 

Now, we need to tell Svelte Preprocess to prepend our `styles.scss` file. To do that, add the following code to `const config`.
```js
    preprocess: SveltePreprocess({
        scss: {
            prependData: `@import '${sassPath}styles.scss';`
        }
    }),
```

If you have MDsveX installed, this will look a bit different:

```js
preprocess: [SveltePreprocess({
					scss: {
						prependData: `@import '${sassPath}styles.scss';`
					}
				}), 
				mdsvex(mdsvexConfig)],
```

That's it! Everything inside of your `styles.scss` file will now be available globally.

