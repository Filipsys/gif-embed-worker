import PNGImage from "pnglib-es6";

export default {
	async fetch(request, env, ctx): Promise<Response> {
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
					});
				</script>
			`;

			return new Response(htmlData, {
				headers: { "Content-Type": "text/html" }
			});
		}

		if (pathname === "list.png") {
			const list = await env.IMAGES.list();

			// const svg = `
			// 	<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400">
			// 		<rect width="800" height="400" fill="#333"/>
			// 		<text x="50" y="120" font-size="64" fill="white">
			// 			${list.objects.map((element) => element.key).toString()}
			// 		</text>
			// 	</svg>
			// `;

			const image = new PNGImage(100, 100, 8);
			const binary = Uint8Array.from(atob(image.getBase64()), (char) => char.charCodeAt(0));

			return new Response(binary, {
				headers: { "Content-Type": "image/png" },
			});
		}

		const asset = await env.IMAGES.get(pathname)

		return new Response(await asset?.arrayBuffer(), {
			headers: { "Content-Type": "image/gif" },
		});
	},
} satisfies ExportedHandler<Env>;
