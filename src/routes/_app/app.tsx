import { createFileRoute } from "@tanstack/react-router";
import { endOfWeek, format, startOfWeek, subWeeks } from "date-fns";
import { es } from "date-fns/locale";
import { Check, Plus } from "lucide-react";
import { ExtraSummary } from "#/components/extra-summary";
import { MealCard } from "#/components/meal-card";
import { Button } from "#/components/ui/button";
import { WaterGoalProgress } from "#/components/water-goal-progress";
import { useAuth } from "#/lib/auth";
import { useComposer } from "#/lib/composer";
import { getExtraStats } from "#/lib/extra-stats";
import { useWaterGoalPreference } from "#/lib/preferences";
import { useDeleteMeal, useMealsInRange, useMealsOfDay } from "#/lib/queries";
import {
	MEAL_TYPE_LABELS,
	MEAL_TYPES,
	type Meal,
	normalizeEntryType,
} from "#/lib/types";
import { useToday } from "#/lib/use-today";

export const Route = createFileRoute("/_app/app")({ component: TodayPage });

function TodayPage() {
	const { user } = useAuth();
	const today = useToday();
	const { data: meals, isLoading } = useMealsOfDay(today);
	const deleteMeal = useDeleteMeal();
	const composer = useComposer();
	const { waterGoal } = useWaterGoalPreference();

	return (
		<div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-x-10">
			<div className="flex flex-col gap-6">
				<header className="pt-2">
					<p className="text-muted-foreground text-sm capitalize">
						{format(today, "EEEE, d 'de' MMMM", { locale: es })}
					</p>
					<h1 className="font-semibold text-2xl lg:text-3xl">
						Hola{user?.name ? `, ${user.name}` : ""} 👋
					</h1>
				</header>

				{waterGoal.enabled && (
					<div className="lg:hidden">
						<WaterGoalProgress
							waterMl={waterOf(meals ?? [])}
							goalMl={waterGoal.ml}
						/>
					</div>
				)}

				{isLoading && (
					<p className="text-muted-foreground text-sm">Cargando…</p>
				)}

				{!isLoading && (meals?.length ?? 0) === 0 && (
					<div className="flex flex-col items-center gap-4 rounded-xl border border-border border-dashed py-16 text-center">
						<p className="text-muted-foreground">
							Aún no has registrado nada hoy
						</p>
						<Button type="button" onClick={() => composer.openNew()}>
							<Plus className="size-4" /> Añadir comida
						</Button>
					</div>
				)}

				<div className="grid gap-4 xl:grid-cols-2">
					{meals?.map((meal) => (
						<MealCard
							key={meal.id}
							meal={meal}
							onDelete={(id) => deleteMeal.mutate(id)}
						/>
					))}
				</div>
			</div>
			<TodaySummary
				meals={meals ?? []}
				today={today}
				waterGoalMl={waterGoal.enabled ? waterGoal.ml : null}
			/>
		</div>
	);
}

function waterOf(meals: Meal[]) {
	return meals
		.filter((meal) => normalizeEntryType(meal.entry_type) === "water")
		.reduce((total, meal) => total + (meal.water_ml ?? 0), 0);
}

function TodaySummary({
	meals,
	today,
	waterGoalMl,
}: {
	meals: Meal[];
	today: Date;
	waterGoalMl: number | null;
}) {
	const composer = useComposer();
	const weekStart = startOfWeek(today, { weekStartsOn: 1 });
	const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
	const previousStart = subWeeks(weekStart, 1);
	const previousEnd = endOfWeek(previousStart, { weekStartsOn: 1 });
	const { data: weekMeals, isLoading } = useMealsInRange(weekStart, weekEnd);
	const { data: previousMeals, isLoading: isPreviousLoading } = useMealsInRange(
		previousStart,
		previousEnd,
	);
	const loggedTypes = new Set(
		meals
			.filter((meal) => normalizeEntryType(meal.entry_type) === "meal")
			.map((meal) => meal.meal_type),
	);

	return (
		<aside className="hidden flex-col gap-4 lg:sticky lg:top-0 lg:flex">
			<section className="rounded-2xl border bg-card p-4 shadow-sm">
				<h2 className="mb-3 font-medium text-sm">Comidas de hoy</h2>
				<ul className="flex flex-col gap-1">
					{MEAL_TYPES.map((type) => {
						const done = loggedTypes.has(type);
						return (
							<li key={type}>
								<button
									type="button"
									disabled={done}
									onClick={() => composer.openNew({ mealType: type })}
									className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-accent disabled:hover:bg-transparent"
								>
									<span className={done ? "text-muted-foreground" : ""}>
										{MEAL_TYPE_LABELS[type]}
									</span>
									{done ? (
										<Check className="size-4 text-primary" />
									) : (
										<Plus className="size-4 text-muted-foreground" />
									)}
								</button>
							</li>
						);
					})}
				</ul>
			</section>
			<WaterGoalProgress waterMl={waterOf(meals)} goalMl={waterGoalMl} />
			<ExtraSummary
				stats={getExtraStats({
					meals: weekMeals ?? [],
					previousMeals: previousMeals ?? [],
					start: weekStart,
					end: weekEnd,
					previousStart,
					previousEnd,
				})}
				period="semana"
				isLoading={isLoading || isPreviousLoading}
			/>
		</aside>
	);
}
