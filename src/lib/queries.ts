import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { endOfDay, startOfDay } from "date-fns";
import { pb } from "./pocketbase";
import type { Meal, MealForm, ShareLink } from "./types";

function pbDate(d: Date) {
	return d.toISOString().replace("T", " ");
}

export function useMealsOfDay(day: Date) {
	const from = pbDate(startOfDay(day));
	const to = pbDate(endOfDay(day));
	return useQuery({
		queryKey: ["meals", "day", from],
		queryFn: () =>
			pb.collection("meals").getFullList<Meal>({
				filter: pb.filter("eaten_at >= {:from} && eaten_at <= {:to}", {
					from,
					to,
				}),
				sort: "eaten_at",
			}),
	});
}

export function useMealHistory() {
	return useQuery({
		queryKey: ["meals", "history"],
		queryFn: () =>
			pb.collection("meals").getFullList<Meal>({ sort: "-eaten_at" }),
	});
}

export function useCreateMeal() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: MealForm) =>
			pb.collection("meals").create<Meal>({
				...data,
				eaten_at: pbDate(new Date(data.eaten_at)),
				user: pb.authStore.record?.id,
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meals"] }),
	});
}

export function useDeleteMeal() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => pb.collection("meals").delete(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meals"] }),
	});
}

export function useShareLinks() {
	return useQuery({
		queryKey: ["share_links"],
		queryFn: () =>
			pb.collection("share_links").getFullList<ShareLink>({ sort: "-created" }),
	});
}

export function useCreateShareLink() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () =>
			pb.collection("share_links").create<ShareLink>({
				user: pb.authStore.record?.id,
				token: crypto.randomUUID().replaceAll("-", ""),
				active: true,
			}),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["share_links"] }),
	});
}

export function useDeleteShareLink() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => pb.collection("share_links").delete(id),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["share_links"] }),
	});
}
