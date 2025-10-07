import { initWasm, Resvg } from "@resvg/resvg-wasm";

let wasmReady: Promise<void> | null = null;

export default {
	async fetch(request, env, ctx): Promise<Response> {
		if (!wasmReady) {
			const wasmAsset = await env.ASSETS.fetch("index_bg.wasm");
			wasmReady = initWasm(wasmAsset);
		}

    await wasmReady;

		let { pathname } = new URL(request.url);
		pathname = pathname.slice(1);

		if (pathname === "new") {
			const htmlData = `
				<div style="width:100%; height:100dvh; display:flex; flex-direction:column;
										justify-content:center; align-items:center">
					<div>
						<label>Key:</label>
						<input type="password" id="password" />
					</div>

					<input type="file" id="file" accept="image/png, image/jpeg, image/webp, image/gif" />
					<button type="submit" id="submit">Submit</button>
				</div>

				<script>
					document.getElementById("submit").addEventListener("click", () => {
						const passwordField = document.getElementById("password").value;
						const fileField = document.getElementById("file").value;

						if (passwordField === "") return;
						if (fileField === "") return;

						const encoder = new TextEncoder();
						window.crypto.subtle.digest("SHA-256", encoder.encode(passwordField)).then(value => {
							console.log(value.byteLength);
						});

						fetch()
					});
				</script>
			`;

			return new Response(htmlData, {
				headers: { "Content-Type": "text/html" }
			});
		}

		if (pathname === "list") {
			const list = await env.IMAGES.list();

			// const svg = `
			// 	<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400">
			// 		<rect width="800" height="400" fill="#333"/>
			// 		<text x="50" y="120" font-size="64" fill="white">
			// 			${list.objects.map((element) => element.key).toString()}
			// 		</text>
			// 	</svg>
			// `;

			const svg = `<svg width="400" height="200"><text x="20" y="100">Hello!</text></svg>`;
			const resvg = new Resvg(svg);
			const png = resvg.render().asPng();

			return new Response(png, { headers: { "Content-Type": "image/png" } });
		}

		if (pathname === "performlogin" && request.method === "POST") {
			if (request.headers.get("Authorization") === null) return new Response("No authorization header", { status: 200 });

    // Base64 sha-256
			if (request.headers.get("Authorization") !== env.AUTHKEY) return new Response("Incorrect password", { status: 200 });
		}

		let asset;
		if (!pathname.endsWith(".gif")) {
			asset = await env.IMAGES.get(pathname + ".gif");
		} else {
			asset = await env.IMAGES.get(pathname);
		}

		return new Response(await asset?.arrayBuffer(), {
			headers: { "Content-Type": "image/gif" },
		});
	},
} satisfies ExportedHandler<Env>;
