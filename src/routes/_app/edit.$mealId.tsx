import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { MealForm } from "#/components/meal-form";
import { useMeal, useUpdateMeal } from "#/lib/queries";
import { normalizeEntryType } from "#/lib/types";

export const Route = createFileRoute("/_app/edit/$mealId")({
	component: EditMealPage,
});

function EditMealPage() {
	const { mealId } = Route.useParams();
	const navigate = useNavigate();
	const { data: meal, isLoading, isError } = useMeal(mealId);
	const updateMeal = useUpdateMeal();

	if (isLoading) return <p className="text-muted-foreground">Cargando…</p>;
	if (isError || !meal) {
		return (
			<p className="text-destructive">No se ha podido cargar la entrada.</p>
		);
	}

	const photos = meal.photos?.length
		? meal.photos
		: meal.photo_url
			? [{ url: meal.photo_url, key: meal.photo_key }]
			: [];

	return (
		<div className="flex flex-col gap-6">
			<header className="pt-2">
				<h1 className="font-semibold text-2xl">Editar entrada</h1>
			</header>
			<MealForm
				initialValues={{
					entry_type: normalizeEntryType(meal.entry_type),
					description: meal.description,
					meal_type: meal.meal_type,
					water_ml: meal.water_ml ?? 250,
					finished: !meal.unfinished,
					unfinished_note: meal.unfinished_note ?? "",
					eaten_at: format(new Date(meal.eaten_at), "yyyy-MM-dd'T'HH:mm"),
					photo_url: meal.photo_url,
					photo_key: meal.photo_key,
					photos,
				}}
				submitLabel="Guardar cambios"
				onSubmit={async (values) => {
					await updateMeal.mutateAsync({ id: meal.id, data: values });
					navigate({ to: "/" });
				}}
			/>
		</div>
	);
}
