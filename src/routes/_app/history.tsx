import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DiaryHeader } from "#/components/diary-tabs";
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
		<div className="flex flex-col gap-6 lg:mx-auto lg:w-full lg:max-w-5xl">
			<DiaryHeader />

			{isLoading && <p className="text-muted-foreground text-sm">Cargando…</p>}

			{!isLoading && meals.length === 0 && (
				<p className="text-muted-foreground">
					Todavía no hay comidas registradas.
				</p>
			)}

			{groupByDay(meals).map(([day, dayMeals]) => (
				<section
					key={day}
					className="flex flex-col gap-3 lg:grid lg:grid-cols-[10rem_minmax(0,1fr)] lg:gap-6 lg:border-border lg:border-t lg:pt-5"
				>
					<h2 className="font-medium text-muted-foreground text-sm capitalize lg:sticky lg:top-0 lg:pt-1">
						{format(new Date(day), "EEEE, d 'de' MMMM", { locale: es })}
					</h2>
					<div className="grid gap-3 xl:grid-cols-2">
						{dayMeals.map((meal) => (
							<MealCard
								key={meal.id}
								meal={meal}
								onDelete={(id) => deleteMeal.mutate(id)}
							/>
						))}
					</div>
				</section>
			))}

			{hasNextPage && (
				<Button
					type="button"
					variant="outline"
					className="lg:self-center lg:px-10"
					disabled={isFetchingNextPage}
					onClick={() => fetchNextPage()}
				>
					{isFetchingNextPage ? "Cargando…" : "Cargar más"}
				</Button>
			)}
		</div>
	);
}
