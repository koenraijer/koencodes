import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';
import SveltePreprocess from 'svelte-preprocess';
import vercel from '@sveltejs/adapter-vercel'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const filePath = dirname(fileURLToPath(import.meta.url))
const sassPath = `${filePath}/src/styles/`

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', ...mdsvexConfig.extensions],

	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [SveltePreprocess({
					scss: {
						prependData: `@import '${sassPath}styles.scss';`
					}
				}), 
				mdsvex(mdsvexConfig)],

	kit: {
		adapter: vercel(),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
	},
};

export default config;

// OLD ADAPTER
// adapter: adapter(),
// import adapter from '@sveltejs/adapter-auto';