import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { MealForm } from "#/components/meal-form";
import { useCreateMeal } from "#/lib/queries";
import type { MealType } from "#/lib/types";

export const Route = createFileRoute("/_app/nueva")({ component: NewMealPage });

function suggestMealType(): MealType {
	const h = new Date().getHours();
	if (h < 11) return "desayuno";
	if (h < 13) return "almuerzo";
	if (h < 16) return "comida";
	if (h < 19) return "merienda";
	if (h < 23) return "cena";
	return "snack";
}

function NewMealPage() {
	const navigate = useNavigate();
	const createMeal = useCreateMeal();

	return (
		<div className="flex flex-col gap-6">
			<header className="pt-2">
				<h1 className="font-semibold text-2xl">Nueva comida</h1>
			</header>
			<MealForm
				initialValues={{
					entry_type: "meal",
					description: "",
					meal_type: suggestMealType(),
					water_ml: 250,
					eaten_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
					photo_url: "",
					photo_key: "",
					photos: [],
				}}
				submitLabel="Guardar comida"
				onSubmit={async (values) => {
					await createMeal.mutateAsync(values);
					navigate({ to: "/" });
				}}
			/>
		</div>
	);
}
