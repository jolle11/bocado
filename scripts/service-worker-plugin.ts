import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { Plugin } from "vite";

const STATIC_URLS = [
	"/",
	"/manifest.webmanifest",
	"/favicon.ico",
	"/favicon-16.png",
	"/favicon-32.png",
	"/apple-touch-icon.png",
	"/logo192.png",
	"/logo512.png",
];

export function serviceWorkerPlugin(): Plugin {
	return {
		name: "bocado-service-worker",
		apply: "build",
		enforce: "post",
		async writeBundle(options, bundle) {
			if (!options.dir || resolve(options.dir) !== resolve(".output/public")) {
				return;
			}

			const precacheUrls = [
				...STATIC_URLS,
				...Object.keys(bundle).map((fileName) => `/${fileName}`),
			].sort();
			const template = await readFile(
				resolve("src/service-worker.js"),
				"utf8",
			);
			const staticContents = await Promise.all(
				STATIC_URLS.filter((url) => url !== "/").map((url) =>
					readFile(join(resolve("public"), url.slice(1))),
				),
			);
			const buildHash = createHash("sha256")
				.update(precacheUrls.join("\n"))
				.update(template);
			for (const content of staticContents) buildHash.update(content);
			const buildId = buildHash.digest("hex").slice(0, 12);
			const serviceWorker = template
				.replace("__BUILD_ID__", buildId)
				.replace("__PRECACHE_URLS__", JSON.stringify(precacheUrls));

			await writeFile(join(options.dir, "sw.js"), serviceWorker);
			console.log(
				`Generated sw.js (${buildId}) with ${precacheUrls.length} precached URLs`,
			);
		},
	};
}
