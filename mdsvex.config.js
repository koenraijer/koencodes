const config = {
	extensions: ['.svelte.md', '.md', '.svx'],

	smartypants: {
		dashes: 'oldschool',
	},

	remarkPlugins: [],
	rehypePlugins: [],

	layout: {
		blog: '/src/lib/layouts/blog.svelte',
	},
};

export default config;
