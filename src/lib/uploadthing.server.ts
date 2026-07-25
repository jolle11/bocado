import {
	createRouteHandler,
	createUploadthing,
	type FileRouter,
} from "uploadthing/server";

const f = createUploadthing();

export const uploadRouter = {
	mealImage: f({
		image: { maxFileSize: "8MB", maxFileCount: 1 },
	}).onUploadComplete(async ({ file }) => {
		return { url: file.ufsUrl, key: file.key };
	}),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;

export const uploadthingHandler = createRouteHandler({
	router: uploadRouter,
});
