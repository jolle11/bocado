import { format } from "date-fns";
import { MealForm } from "#/components/meal-form/meal-form";
import { useCreateMeal, useMeal, useUpdateMeal } from "#/lib/queries";
import { type MealType, normalizeEntryType } from "#/lib/types";

function suggestMealType(): MealType {
	const h = new Date().getHours();
	if (h < 11) return "desayuno";
	if (h < 13) return "almuerzo";
	if (h < 16) return "comida";
	if (h < 19) return "merienda";
	if (h < 23) return "cena";
	return "snack";
}

/** Fecha elegida (yyyy-MM-dd) con la hora actual, o ahora si no hay fecha. */
function initialEatenAt(date?: string) {
	const now = new Date();
	return date
		? `${date}T${format(now, "HH:mm")}`
		: format(now, "yyyy-MM-dd'T'HH:mm");
}

export function NewMealEditor({
	mealType,
	date,
	onDone,
}: {
	mealType?: MealType;
	date?: string;
	onDone: () => void;
}) {
	const createMeal = useCreateMeal();

	return (
		<MealForm
			initialValues={{
				entry_type: "meal",
				description: "",
				meal_type: mealType ?? suggestMealType(),
				water_ml: 250,
				finished: true,
				unfinished_note: "",
				eaten_at: initialEatenAt(date),
				photo_url: "",
				photo_key: "",
				photos: [],
			}}
			submitLabel="Guardar comida"
			showTemplates
			onSubmit={async (values) => {
				await createMeal.mutateAsync(values);
				onDone();
			}}
		/>
	);
}

export function EditMealEditor({
	mealId,
	onDone,
}: {
	mealId: string;
	onDone: () => void;
}) {
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
				onDone();
			}}
		/>
	);
}
