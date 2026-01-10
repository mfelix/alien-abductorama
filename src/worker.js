// Cloudflare Workers entry point
// Static assets are served automatically via the [assets] configuration in wrangler.toml

export default {
	async fetch(request, env, ctx) {
		// Static assets are handled automatically by the assets configuration
		// This worker can be extended to add custom logic if needed
		return new Response('Not Found', { status: 404 });
	},
};
