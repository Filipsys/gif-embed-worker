export default {
	async fetch(request, env, ctx): Promise<Response> {
		let { pathname } = new URL(request.url);
		pathname = pathname.slice(1);

		if (pathname === "list") {
			const list = await env.IMAGES.list();

			const svg = `
				<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400">
					<rect width="800" height="400" fill="#333"/>
					<text x="50" y="120" font-size="64" fill="white">
						${list.objects.map((element) => element.key).toString()}
					</text>
				</svg>
			`;

			return new Response(svg, {
				headers: { "Content-Type": "image/png" },
			});
		}

		const asset = await env.IMAGES.get(pathname)

		return new Response(await asset?.arrayBuffer(), {
			headers: { "Content-Type": "image/gif" },
		});
	},
} satisfies ExportedHandler<Env>;
