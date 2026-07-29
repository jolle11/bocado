import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import {
	type Query,
	type QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import {
	type ReactNode,
	useCallback,
	useMemo,
	useSyncExternalStore,
} from "react";
import { pb } from "./pocketbase";

export const QUERY_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;
const CACHE_BUSTER = "bocado-meals-v1";
const NOOP_PERSISTER = {
	persistClient: () => undefined,
	restoreClient: () => undefined,
	removeClient: () => undefined,
};

export function shouldPersistMealQuery(query: Query) {
	return query.state.status === "success" && query.queryKey[0] === "meals";
}

export function mealCacheStorageKey(userId: string) {
	return `bocado-query-cache-v1:${userId}`;
}

export function QueryPersistenceProvider({
	client,
	children,
}: {
	client: QueryClient;
	children: ReactNode;
}) {
	const userId = useAuthenticatedUserId(client);
	const persister = useMemo(() => {
		if (!userId || typeof window === "undefined") return NOOP_PERSISTER;
		return createSyncStoragePersister({
			storage: window.localStorage,
			key: mealCacheStorageKey(userId),
		});
	}, [userId]);

	if (!userId) {
		return (
			<QueryClientProvider client={client}>{children}</QueryClientProvider>
		);
	}

	return (
		<PersistQueryClientProvider
			key={userId}
			client={client}
			persistOptions={{
				persister,
				maxAge: QUERY_CACHE_MAX_AGE,
				buster: CACHE_BUSTER,
				dehydrateOptions: {
					shouldDehydrateQuery: shouldPersistMealQuery,
					shouldDehydrateMutation: () => false,
				},
			}}
		>
			{children}
		</PersistQueryClientProvider>
	);
}

function useAuthenticatedUserId(client: QueryClient) {
	const subscribe = useCallback(
		(onStoreChange: () => void) =>
			pb.authStore.onChange(() => {
				client.clear();
				onStoreChange();
			}),
		[client],
	);

	return useSyncExternalStore(
		subscribe,
		() => pb.authStore.record?.id ?? null,
		() => null,
	);
}
