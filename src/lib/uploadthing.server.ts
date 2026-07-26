import {
	createRouteHandler,
	createUploadthing,
	type FileRouter,
	UploadThingError,
	UTApi,
	UTFile,
} from "uploadthing/server";
import {
	needsServerOptimization,
	optimizeImageOnServer,
} from "./optimize-image.server";
import { authenticateRequest } from "./pocketbase.server";

const f = createUploadthing();
const utapi = new UTApi();

async function optimizeUploadedFile(file: {
	key: string;
	name: string;
	size: number;
	ufsUrl: string;
}) {
	if (!needsServerOptimization(file.size)) {
		return { url: file.ufsUrl, key: file.key };
	}

	let optimizedKey: string | undefined;
	try {
		const response = await fetch(file.ufsUrl);
		if (!response.ok) throw new Error("Uploaded image could not be downloaded");

		const input = Buffer.from(await response.arrayBuffer());
		const optimized = await optimizeImageOnServer(input);
		const baseName = file.name.replace(/\.[^.]+$/, "");
		const uploadBytes = new Uint8Array(optimized.length);
		uploadBytes.set(optimized);
		const result = await utapi.uploadFiles(
			new UTFile([uploadBytes], `${baseName}.webp`, { type: "image/webp" }),
		);

		if (result.error) throw new Error(result.error.message);
		optimizedKey = result.data.key;

		const deletion = await utapi.deleteFiles(file.key);
		if (!deletion.success) {
			throw new Error("Original image could not be deleted");
		}

		return { url: result.data.ufsUrl, key: result.data.key };
	} catch (error) {
		try {
			await utapi.deleteFiles(
				optimizedKey ? [file.key, optimizedKey] : file.key,
			);
		} catch (cleanupError) {
			console.error(
				"Could not clean up failed image optimization",
				cleanupError,
			);
		}
		throw new UploadThingError({
			code: "UPLOAD_FAILED",
			message: "No se pudo optimizar la imagen",
			cause: error,
		});
	}
}

export const uploadRouter = {
	mealImage: f(
		{
			image: { maxFileSize: "8MB", maxFileCount: 5 },
		},
		{ awaitServerData: true },
	)
		.middleware(async ({ req }) => {
			try {
				const user = await authenticateRequest(req);
				if (!user) throw new Error("Unauthenticated");
				return { userId: user.id };
			} catch {
				throw new UploadThingError({
					code: "FORBIDDEN",
					message: "Inicia sesión para subir imágenes",
				});
			}
		})
		.onUploadComplete(({ file }) => optimizeUploadedFile(file)),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;

export const uploadthingHandler = createRouteHandler({
	router: uploadRouter,
});
