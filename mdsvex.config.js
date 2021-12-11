const config = {
	extensions: ['.svelte.md', '.md', '.svx'],

	smartypants: {
		dashes: 'oldschool',
		quotes: true,
		ellipses: true,
		backticks: 'all' = true,
	},

	remarkPlugins: [],
	rehypePlugins: [],

	layout: {
		blog: 'src/lib/layouts/blog.svelte',
	},
};

export default config;
