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
import { DiaryTabs } from "#/components/diary-tabs";
import { ExtraSummary } from "#/components/extra-summary";
import { MealCard } from "#/components/meal-card";
import { Button } from "#/components/ui/button";
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
		<div className="flex flex-col gap-5">
			<header className="pt-2">
				<h1 className="font-semibold text-2xl">Diario</h1>
			</header>
			<DiaryTabs />
			<div className="flex items-center justify-between">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setAnchor((date) => subWeeks(date, 1))}
					aria-label="Semana anterior"
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
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setAnchor((date) => addWeeks(date, 1))}
					aria-label="Semana siguiente"
				>
					<ChevronRight className="size-5" />
				</Button>
			</div>

			<ExtraSummary
				stats={extraStats}
				period="semana"
				isLoading={isLoading || isPreviousLoading}
			/>

			{isLoading && <p className="text-muted-foreground text-sm">Cargando…</p>}
			{days.map((day) => {
				const dayMeals = (meals ?? []).filter((meal) =>
					isSameDay(new Date(meal.eaten_at), day),
				);
				return (
					<section key={day.toISOString()} className="flex flex-col gap-3">
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
							<p className="py-1 text-muted-foreground text-xs">Sin comidas</p>
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
	);
}
