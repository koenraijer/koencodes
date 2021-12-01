import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';
import adapter from '@sveltejs/adapter-auto';
import SveltePreprocess from 'svelte-preprocess';
import vercel from '@sveltejs/adapter-vercel'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', ...mdsvexConfig.extensions],

	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [SveltePreprocess(), mdsvex(mdsvexConfig)],

	kit: {
		adapter: vercel()

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte'
	}
};

export default config;

// OLD ADAPTER
// adapter: adapter(),