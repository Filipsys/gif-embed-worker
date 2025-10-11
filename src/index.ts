// import { initWasm, Resvg } from "@resvg/resvg-wasm";
// let wasmReady: Promise<void> | null = null;

export default {
	async fetch(request, env, ctx): Promise<Response> {
		// if (!wasmReady) {
		// 	const wasmAsset = await env.ASSETS.fetch("index_bg.wasm");
		// 	wasmReady = initWasm(wasmAsset);
		// }
		//
  //   await wasmReady;

		let { pathname } = new URL(request.url);
		pathname = pathname.slice(1);

		if (pathname === "new" && request.method === "POST") {
			if (request.headers.get("Authorization") === null) {
        return new Response("No authorization header", { status: 401 });
      }

			if (request.headers.get("Authorization") !== env.AUTHKEY) {
        return new Response("Incorrect password", { status: 401 });
      }

      const data = await request.formData();
      const name = data.get("name") as string;
      const image = data.get("file") as File;
      if (!data || !name || !image) {
        return new Response("Missing data", { status: 401 });
      }
      
      await env.IMAGES.put(name, image);
      return new Response("Successfully added asset", { status: 200 });
		}

		if (pathname === "new") {
			const htmlData = `
				<form style="width:100%; height:100dvh; display:flex; flex-direction:column;
										justify-content:center; align-items:center">
					<div>
						<label>Key:</label>
						<input type="password" name="password" id="password" required />
					</div>

					<input type="file" name="file" id="file" required accept="image/png, image/jpeg, image/webp, image/gif" />
					<button type="submit" id="submit">Submit</button>
				</form>

				<script>
          const form = document.querySelector("form");

          form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const passwordField = form.querySelector("input[name="password"]").value;
            const encoder = new TextEncoder();

            window.crypto.subtle.digest("SHA-256", encoder.encode(passwordField)).then(async (value) => {
              const hashArray = Array.from(new Uint8Array(value));
              const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

              const data = new FormData(form);
              data.set("password", hashHex);

              const response = await fetch("/login", {
                method: "POST",
                body: data
              });

              const result = await response.text();
              console.log(result);
            });
          });
				</script>
			`;

			return new Response(htmlData, {
				headers: { "Content-Type": "text/html" }
			});
		}

		// if (pathname === "list") {
		// 	const list = await env.IMAGES.list();

			// const svg = `
			// 	<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400">
			// 		<rect width="800" height="400" fill="#333"/>
			// 		<text x="50" y="120" font-size="64" fill="white">
			// 			${list.objects.map((element) => element.key).toString()}
			// 		</text>
			// 	</svg>
			// `;

			// const svg = `<svg width="400" height="200"><text x="20" y="100">Hello!</text></svg>`;
			// const resvg = new Resvg(svg);
			// const png = resvg.render().asPng();
			//
			// return new Response(png, { headers: { "Content-Type": "image/png" } });
		// }

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
