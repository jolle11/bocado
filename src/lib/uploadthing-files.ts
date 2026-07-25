import { pb } from "./pocketbase";

export async function deleteUploadthingFiles(keys: string[]) {
	const uniqueKeys = [...new Set(keys.filter(Boolean))];
	if (uniqueKeys.length === 0) return;

	const response = await fetch("/api/uploadthing-files", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${pb.authStore.token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ keys: uniqueKeys }),
	});

	if (!response.ok) {
		throw new Error("Could not delete UploadThing files");
	}
}
