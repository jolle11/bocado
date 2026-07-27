import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { endOfDay, startOfDay } from "date-fns";
import { pb } from "./pocketbase";
import type { Meal, MealForm, ShareLink } from "./types";
import { deleteUploadthingFiles } from "./uploadthing-files";

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

export function useMealsInRange(fromDate: Date, toDate: Date) {
	const from = pbDate(startOfDay(fromDate));
	const to = pbDate(endOfDay(toDate));
	return useQuery({
		queryKey: ["meals", "range", from, to],
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

export function useMeal(id: string) {
	return useQuery({
		queryKey: ["meals", "detail", id],
		queryFn: () => pb.collection("meals").getOne<Meal>(id),
		enabled: Boolean(id),
	});
}

export function useCreateMeal() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: MealForm) => {
			const { finished, ...meal } = data;
			return pb.collection("meals").create<Meal>({
				...meal,
				unfinished: !finished,
				unfinished_note: finished ? "" : data.unfinished_note.trim(),
				eaten_at: pbDate(new Date(data.eaten_at)),
				user: pb.authStore.record?.id,
			});
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meals"] }),
	});
}

export function useUpdateMeal() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: MealForm }) => {
			const { finished, ...meal } = data;
			return pb.collection("meals").update<Meal>(id, {
				...meal,
				unfinished: !finished,
				unfinished_note: finished ? "" : data.unfinished_note.trim(),
				eaten_at: pbDate(new Date(data.eaten_at)),
			});
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meals"] }),
	});
}

export function useDeleteMeal() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const meal = await pb.collection("meals").getOne<Meal>(id);
			await pb.collection("meals").delete(id);

			const keys = meal.photos?.length
				? meal.photos.map((photo) => photo.key)
				: [meal.photo_key];
			await deleteUploadthingFiles(keys).catch((cleanupError) => {
				console.error("Could not delete meal photos", cleanupError);
			});
		},
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
		mutationFn: ({
			expiresAt,
			visibleFrom,
			visibleUntil,
		}: {
			expiresAt: Date | null;
			visibleFrom: Date | null;
			visibleUntil: Date | null;
		}) =>
			pb.collection("share_links").create<ShareLink>({
				user: pb.authStore.record?.id,
				token: crypto.randomUUID().replaceAll("-", ""),
				active: true,
				expires_at: expiresAt ? pbDate(expiresAt) : "",
				visible_from: visibleFrom ? pbDate(startOfDay(visibleFrom)) : "",
				visible_until: visibleUntil ? pbDate(endOfDay(visibleUntil)) : "",
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
