import {
	createRouteHandler,
	createUploadthing,
	type FileRouter,
	UploadThingError,
} from "uploadthing/server";
import { authenticateRequest } from "./pocketbase.server";

const f = createUploadthing();

export const uploadRouter = {
	mealImage: f({
		image: { maxFileSize: "8MB", maxFileCount: 5 },
	})
		.middleware(async ({ req }) => {
			try {
				const user = await authenticateRequest(req);
				return { userId: user.id };
			} catch {
				throw new UploadThingError({
					code: "UNAUTHORIZED",
					message: "Inicia sesión para subir imágenes",
				});
			}
		})
		.onUploadComplete(async ({ file }) => {
			return { url: file.ufsUrl, key: file.key };
		}),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;

export const uploadthingHandler = createRouteHandler({
	router: uploadRouter,
});
