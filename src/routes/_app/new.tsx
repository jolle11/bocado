import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { NewMealEditor } from "#/components/meal-editors";
import { MEAL_TYPES, type MealType } from "#/lib/types";

export const Route = createFileRoute("/_app/new")({
	validateSearch: (
		search: Record<string, unknown>,
	): { mealType?: MealType; date?: string } => ({
		mealType:
			typeof search.mealType === "string" &&
			MEAL_TYPES.includes(search.mealType as MealType)
				? (search.mealType as MealType)
				: undefined,
		date:
			typeof search.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(search.date)
				? search.date
				: undefined,
	}),
	component: NewMealPage,
});

function NewMealPage() {
	const navigate = useNavigate();
	const { mealType, date } = Route.useSearch();

	return (
		<div className="flex flex-col gap-6 lg:max-w-2xl">
			<header className="pt-2">
				<h1 className="font-semibold text-2xl">Nueva comida</h1>
			</header>
			<NewMealEditor
				mealType={mealType}
				date={date}
				onDone={() => navigate({ to: "/app" })}
			/>
		</div>
	);
}
