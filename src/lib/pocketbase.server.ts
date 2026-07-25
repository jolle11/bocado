import PocketBase, { type AuthRecord } from "pocketbase";

function bearerToken(request: Request) {
	const authorization = request.headers.get("authorization");
	if (!authorization?.startsWith("Bearer ")) return "";
	return authorization.slice("Bearer ".length);
}

export async function authenticateRequest(
	request: Request,
): Promise<AuthRecord> {
	const token = bearerToken(request);
	if (!token) throw new Error("Unauthorized");

	const pb = new PocketBase(
		process.env.POCKETBASE_URL ?? "http://127.0.0.1:8090",
	);
	pb.authStore.save(token);

	try {
		const auth = await pb.collection("users").authRefresh();
		if (!auth.record) throw new Error("Unauthorized");
		return auth.record;
	} catch {
		throw new Error("Unauthorized");
	}
}
