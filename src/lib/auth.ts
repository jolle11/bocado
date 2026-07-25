import type { AuthRecord } from "pocketbase";
import { useEffect, useState, useSyncExternalStore } from "react";
import { pb } from "./pocketbase";

// pb.authStore.record devuelve un objeto nuevo en cada lectura (parsea
// localStorage), así que cacheamos el snapshot (keyed por token) para
// useSyncExternalStore.
let cachedToken: string | undefined;
let cachedRecord: AuthRecord = null;

function getSnapshot() {
	const token = pb.authStore.token;
	if (token !== cachedToken) {
		cachedToken = token;
		cachedRecord = pb.authStore.record;
	}
	return cachedRecord;
}

function subscribe(callback: () => void) {
	return pb.authStore.onChange(callback);
}

export function useAuth() {
	const record = useSyncExternalStore(subscribe, getSnapshot, () => null);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		setIsReady(true);
	}, []);

	return {
		user: record,
		isLoggedIn: record !== null,
		isReady,
	};
}

export async function login(email: string, password: string) {
	await pb.collection("users").authWithPassword(email, password);
}

export async function register(email: string, password: string, name: string) {
	await pb.collection("users").create({
		email,
		password,
		passwordConfirm: password,
		name,
	});
	await login(email, password);
}

export function logout() {
	pb.authStore.clear();
}
