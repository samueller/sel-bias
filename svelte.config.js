import preprocess from 'svelte-preprocess'
import adapter from '@sveltejs/adapter-vercel'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),
	compilerOptions: {
		immutable: true
	},
	kit: {
		adapter: adapter(),
		target: '#svelte'
		// files: {
		// 	assets: 'public',
		// 	hooks: 'hooks',
		// 	lib: 'lib',
		// 	routes: 'routes',
		// 	serviceWorker: 'lib/service-worker',
		// 	template: 'lib/index.html'
		// }
	}
}

export default config
