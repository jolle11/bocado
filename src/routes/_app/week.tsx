import { createFileRoute } from "@tanstack/react-router";
import {
	addWeeks,
	endOfWeek,
	format,
	isSameDay,
	startOfWeek,
	subWeeks,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { DiaryHeader } from "#/components/diary-tabs";
import { ExtraSummary } from "#/components/extra-summary";
import { MealCard } from "#/components/meal-card";
import { Kbd } from "#/components/shortcuts-dialog";
import { Button } from "#/components/ui/button";
import { useHotkey } from "#/lib/composer";
import { getExtraStats } from "#/lib/extra-stats";
import { useDeleteMeal, useMealsInRange } from "#/lib/queries";

export const Route = createFileRoute("/_app/week")({
	component: WeekPage,
});

function WeekPage() {
	const [anchor, setAnchor] = useState(new Date());
	const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
	const weekEnd = endOfWeek(anchor, { weekStartsOn: 1 });
	const { data: meals, isLoading } = useMealsInRange(weekStart, weekEnd);
	const previousWeekStart = subWeeks(weekStart, 1);
	const previousWeekEnd = endOfWeek(previousWeekStart, { weekStartsOn: 1 });
	const { data: previousMeals, isLoading: isPreviousLoading } = useMealsInRange(
		previousWeekStart,
		previousWeekEnd,
	);
	const deleteMeal = useDeleteMeal();
	useHotkey("ArrowLeft", () => setAnchor((date) => subWeeks(date, 1)));
	useHotkey("ArrowRight", () => setAnchor((date) => addWeeks(date, 1)));
	const extraStats = getExtraStats({
		meals: meals ?? [],
		previousMeals: previousMeals ?? [],
		start: weekStart,
		end: weekEnd,
		previousStart: previousWeekStart,
		previousEnd: previousWeekEnd,
	});
	const days = Array.from({ length: 7 }, (_, index) => {
		const date = new Date(weekStart);
		date.setDate(weekStart.getDate() + index);
		return date;
	});

	return (
		<div className="flex flex-col gap-5 lg:mx-auto lg:w-full lg:max-w-5xl lg:gap-6">
			<DiaryHeader />
			<div className="flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:items-center lg:gap-6">
				<div className="flex items-center justify-between lg:rounded-2xl lg:border lg:bg-card lg:p-3 lg:shadow-sm">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setAnchor((date) => subWeeks(date, 1))}
						aria-label="Semana anterior"
						title="Semana anterior (←)"
					>
						<ChevronLeft className="size-5" />
					</Button>
					<div className="text-center">
						<p className="font-medium text-sm">
							{format(weekStart, "d MMM", { locale: es })} –{" "}
							{format(weekEnd, "d MMM yyyy", { locale: es })}
						</p>
						<button
							type="button"
							onClick={() => setAnchor(new Date())}
							className="text-primary text-xs"
						>
							Volver a esta semana
						</button>
						<p className="mt-1 hidden items-center justify-center gap-1 text-muted-foreground text-xs lg:flex">
							<Kbd>←</Kbd>
							<Kbd>→</Kbd> para cambiar de semana
						</p>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setAnchor((date) => addWeeks(date, 1))}
						aria-label="Semana siguiente"
						title="Semana siguiente (→)"
					>
						<ChevronRight className="size-5" />
					</Button>
				</div>

				<ExtraSummary
					stats={extraStats}
					period="semana"
					isLoading={isLoading || isPreviousLoading}
				/>
			</div>

			{isLoading && <p className="text-muted-foreground text-sm">Cargando…</p>}
			<div className="flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:gap-6">
				{days.map((day) => {
					const dayMeals = (meals ?? []).filter((meal) =>
						isSameDay(new Date(meal.eaten_at), day),
					);
					return (
						<section
							key={day.toISOString()}
							className="flex flex-col gap-3 lg:rounded-2xl lg:border lg:bg-card/40 lg:p-4"
						>
							<div className="flex items-center justify-between border-border border-b pb-2">
								<h2
									className={`font-medium text-sm capitalize ${
										isSameDay(day, new Date()) ? "text-primary" : ""
									}`}
								>
									{format(day, "EEEE d", { locale: es })}
								</h2>
								<span className="text-muted-foreground text-xs">
									{dayMeals.length || "—"}
								</span>
							</div>
							{dayMeals.length === 0 ? (
								<p className="py-1 text-muted-foreground text-xs">
									Sin comidas
								</p>
							) : (
								dayMeals.map((meal) => (
									<MealCard
										key={meal.id}
										meal={meal}
										onDelete={(id) => deleteMeal.mutate(id)}
									/>
								))
							)}
						</section>
					);
				})}
			</div>
		</div>
	);
}
