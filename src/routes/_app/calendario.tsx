import { createFileRoute } from "@tanstack/react-router";
import {
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	isSameDay,
	isSameMonth,
	startOfMonth,
	startOfWeek,
	subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { DiaryTabs } from "#/components/diary-tabs";
import { MealCard } from "#/components/meal-card";
import { Button } from "#/components/ui/button";
import { useDeleteMeal, useMealsInRange } from "#/lib/queries";

export const Route = createFileRoute("/_app/calendario")({
	component: CalendarPage,
});

const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

function CalendarPage() {
	const [month, setMonth] = useState(startOfMonth(new Date()));
	const [selectedDay, setSelectedDay] = useState(new Date());
	const calendarStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
	const calendarEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
	const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
	const { data: meals, isLoading } = useMealsInRange(
		calendarStart,
		calendarEnd,
	);
	const deleteMeal = useDeleteMeal();
	const selectedMeals = (meals ?? []).filter((meal) =>
		isSameDay(new Date(meal.eaten_at), selectedDay),
	);

	return (
		<div className="flex flex-col gap-5">
			<header className="pt-2">
				<h1 className="font-semibold text-2xl">Diario</h1>
			</header>
			<DiaryTabs />

			<div className="rounded-2xl border bg-card p-3 shadow-sm">
				<div className="mb-3 flex items-center justify-between">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setMonth((date) => subMonths(date, 1))}
						aria-label="Mes anterior"
					>
						<ChevronLeft className="size-5" />
					</Button>
					<button
						type="button"
						className="font-semibold capitalize"
						onClick={() => {
							setMonth(startOfMonth(new Date()));
							setSelectedDay(new Date());
						}}
					>
						{format(month, "MMMM yyyy", { locale: es })}
					</button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setMonth((date) => addMonths(date, 1))}
						aria-label="Mes siguiente"
					>
						<ChevronRight className="size-5" />
					</Button>
				</div>
				<div className="grid grid-cols-7">
					{weekDays.map((day) => (
						<div
							key={day}
							className="pb-2 text-center font-medium text-muted-foreground text-xs"
						>
							{day}
						</div>
					))}
					{days.map((day) => {
						const count = (meals ?? []).filter((meal) =>
							isSameDay(new Date(meal.eaten_at), day),
						).length;
						const selected = isSameDay(day, selectedDay);
						return (
							<button
								key={day.toISOString()}
								type="button"
								onClick={() => setSelectedDay(day)}
								className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm ${
									selected
										? "bg-primary text-primary-foreground"
										: isSameMonth(day, month)
											? "hover:bg-accent"
											: "text-muted-foreground/40"
								}`}
								aria-label={format(day, "d 'de' MMMM", { locale: es })}
							>
								{format(day, "d")}
								{count > 0 && (
									<span
										className={`absolute bottom-1.5 size-1 rounded-full ${
											selected ? "bg-primary-foreground" : "bg-primary"
										}`}
									/>
								)}
							</button>
						);
					})}
				</div>
			</div>

			<section className="flex flex-col gap-3">
				<h2 className="font-medium capitalize">
					{format(selectedDay, "EEEE, d 'de' MMMM", { locale: es })}
				</h2>
				{isLoading && (
					<p className="text-muted-foreground text-sm">Cargando…</p>
				)}
				{!isLoading && selectedMeals.length === 0 && (
					<p className="rounded-xl border border-dashed py-8 text-center text-muted-foreground text-sm">
						No hay comidas este día
					</p>
				)}
				{selectedMeals.map((meal) => (
					<MealCard
						key={meal.id}
						meal={meal}
						onDelete={(id) => deleteMeal.mutate(id)}
					/>
				))}
			</section>
		</div>
	);
}
