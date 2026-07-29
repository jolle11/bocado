import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DiaryTabs } from "#/components/diary-tabs";
import { MealCard } from "#/components/meal-card";
import { Button } from "#/components/ui/button";
import { useDeleteMeal, useMealHistory } from "#/lib/queries";
import type { Meal } from "#/lib/types";

export const Route = createFileRoute("/_app/history")({
	component: HistoryPage,
});

export function groupByDay(meals: Meal[]) {
	const groups = new Map<string, Meal[]>();
	for (const meal of meals) {
		const day = format(new Date(meal.eaten_at), "yyyy-MM-dd");
		const list = groups.get(day) ?? [];
		list.push(meal);
		groups.set(day, list);
	}
	return [...groups.entries()];
}

function HistoryPage() {
	const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useMealHistory();
	const deleteMeal = useDeleteMeal();
	const meals = data?.pages.flatMap((page) => page.items) ?? [];

	return (
		<div className="flex flex-col gap-6">
			<header className="pt-2">
				<h1 className="font-semibold text-2xl">Diario</h1>
			</header>
			<DiaryTabs />

			{isLoading && <p className="text-muted-foreground text-sm">Cargando…</p>}

			{!isLoading && meals.length === 0 && (
				<p className="text-muted-foreground">
					Todavía no hay comidas registradas.
				</p>
			)}

			{groupByDay(meals).map(([day, dayMeals]) => (
				<section key={day} className="flex flex-col gap-3">
					<h2 className="font-medium text-muted-foreground text-sm capitalize">
						{format(new Date(day), "EEEE, d 'de' MMMM", { locale: es })}
					</h2>
					{dayMeals.map((meal) => (
						<MealCard
							key={meal.id}
							meal={meal}
							onDelete={(id) => deleteMeal.mutate(id)}
						/>
					))}
				</section>
			))}

			{hasNextPage && (
				<Button
					type="button"
					variant="outline"
					disabled={isFetchingNextPage}
					onClick={() => fetchNextPage()}
				>
					{isFetchingNextPage ? "Cargando…" : "Cargar más"}
				</Button>
			)}
		</div>
	);
}
