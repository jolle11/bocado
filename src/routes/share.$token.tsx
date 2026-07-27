import { createFileRoute } from "@tanstack/react-router";
import {
	addDays,
	addMonths,
	addWeeks,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	isAfter,
	isBefore,
	isSameDay,
	isSameMonth,
	startOfDay,
	startOfMonth,
	startOfWeek,
	subDays,
	subMonths,
	subWeeks,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { DisplayControls } from "#/components/display-controls";
import { MealCard } from "#/components/meal-card";
import { Button } from "#/components/ui/button";
import { getSharedMeals } from "#/lib/share-fn";
import type { Meal } from "#/lib/types";

export const Route = createFileRoute("/share/$token")({
	loader: ({ params }) => getSharedMeals({ data: { token: params.token } }),
	component: SharePage,
});

type View = "day" | "week" | "month";

function mealsOfDay(meals: Meal[], day: Date) {
	return meals.filter((meal) => isSameDay(new Date(meal.eaten_at), day));
}

function SharePage() {
	const data = Route.useLoaderData();

	if (!data.found) {
		return (
			<main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 py-6">
				<div className="flex justify-end">
					<DisplayControls />
				</div>
				<div className="flex flex-1 flex-col items-center justify-center gap-2 px-2 text-center">
					<h1 className="font-semibold text-2xl">Enlace no válido</h1>
					<p className="text-muted-foreground">
						{"expired" in data && data.expired
							? "Este enlace ha caducado."
							: "Este enlace no existe o ha sido revocado."}
					</p>
				</div>
			</main>
		);
	}

	return <SharedDiary data={data} />;
}

function SharedDiary({
	data,
}: {
	data: Extract<Awaited<ReturnType<typeof getSharedMeals>>, { found: true }>;
}) {
	const from = data.visibleFrom ? startOfDay(new Date(data.visibleFrom)) : null;
	const until = data.visibleUntil
		? startOfDay(new Date(data.visibleUntil))
		: null;
	const today = startOfDay(new Date());
	const initialDay =
		from && isBefore(today, from)
			? from
			: until && isAfter(today, until)
				? until
				: today;
	const [view, setView] = useState<View>("day");
	const [anchor, setAnchor] = useState(initialDay);

	function inVisiblePeriod(day: Date) {
		const date = startOfDay(day);
		return (
			(!from || !isBefore(date, from)) && (!until || !isAfter(date, until))
		);
	}

	function move(next: Date) {
		if (from && isBefore(next, from)) {
			setAnchor(from);
			return;
		}
		if (until && isAfter(next, until)) {
			setAnchor(until);
			return;
		}
		setAnchor(next);
	}

	const visiblePeriod =
		from || until
			? `${from ? format(from, "d MMM yyyy", { locale: es }) : "inicio"} – ${
					until ? format(until, "d MMM yyyy", { locale: es }) : "hoy"
				}`
			: "Todo el diario";

	return (
		<main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-5 px-4 py-6">
			<div className="flex justify-end">
				<DisplayControls />
			</div>
			<header>
				<p className="font-semibold text-primary text-sm">Bocado</p>
				<h1 className="font-semibold text-2xl">
					Diario de {data.ownerName || "paciente"}
				</h1>
				<p className="text-muted-foreground text-sm">
					Solo lectura · {visiblePeriod}
				</p>
			</header>

			<div className="grid grid-cols-3 rounded-xl bg-muted p-1">
				{[
					{ value: "day", label: "Diario" },
					{ value: "week", label: "Semanal" },
					{ value: "month", label: "Mensual" },
				].map((option) => (
					<button
						key={option.value}
						type="button"
						onClick={() => setView(option.value as View)}
						className={`rounded-lg px-2 py-2 text-center text-sm ${
							view === option.value
								? "bg-card font-medium text-foreground shadow-sm"
								: "text-muted-foreground"
						}`}
					>
						{option.label}
					</button>
				))}
			</div>

			{view === "day" && (
				<DayView
					meals={data.meals}
					day={anchor}
					onPrevious={() => move(subDays(anchor, 1))}
					onNext={() => move(addDays(anchor, 1))}
					canPrevious={inVisiblePeriod(subDays(anchor, 1))}
					canNext={inVisiblePeriod(addDays(anchor, 1))}
				/>
			)}
			{view === "week" && (
				<WeekView
					meals={data.meals}
					anchor={anchor}
					onPrevious={() => move(subWeeks(anchor, 1))}
					onNext={() => move(addWeeks(anchor, 1))}
					canPrevious={
						!from || isAfter(startOfWeek(anchor, { weekStartsOn: 1 }), from)
					}
					canNext={
						!until || isBefore(endOfWeek(anchor, { weekStartsOn: 1 }), until)
					}
					inVisiblePeriod={inVisiblePeriod}
				/>
			)}
			{view === "month" && (
				<MonthView
					meals={data.meals}
					selectedDay={anchor}
					onSelect={move}
					onPrevious={() => move(subMonths(anchor, 1))}
					onNext={() => move(addMonths(anchor, 1))}
					canPrevious={
						!from || isAfter(startOfMonth(anchor), startOfMonth(from))
					}
					canNext={
						!until || isBefore(startOfMonth(anchor), startOfMonth(until))
					}
					inVisiblePeriod={inVisiblePeriod}
				/>
			)}
		</main>
	);
}

function Navigator({
	title,
	onPrevious,
	onNext,
	canPrevious,
	canNext,
}: {
	title: string;
	onPrevious: () => void;
	onNext: () => void;
	canPrevious: boolean;
	canNext: boolean;
}) {
	return (
		<div className="flex items-center justify-between">
			<Button
				variant="ghost"
				size="icon"
				onClick={onPrevious}
				disabled={!canPrevious}
				aria-label="Periodo anterior"
			>
				<ChevronLeft className="size-5" />
			</Button>
			<p className="font-medium text-sm capitalize">{title}</p>
			<Button
				variant="ghost"
				size="icon"
				onClick={onNext}
				disabled={!canNext}
				aria-label="Periodo siguiente"
			>
				<ChevronRight className="size-5" />
			</Button>
		</div>
	);
}

function MealList({ meals, empty }: { meals: Meal[]; empty: string }) {
	if (meals.length === 0) {
		return (
			<p className="rounded-xl border border-dashed py-8 text-center text-muted-foreground text-sm">
				{empty}
			</p>
		);
	}
	return (
		<div className="flex flex-col gap-3">
			{meals.map((meal) => (
				<MealCard key={meal.id} meal={meal} />
			))}
		</div>
	);
}

function DayView({
	meals,
	day,
	...navigation
}: {
	meals: Meal[];
	day: Date;
	onPrevious: () => void;
	onNext: () => void;
	canPrevious: boolean;
	canNext: boolean;
}) {
	return (
		<>
			<Navigator
				title={format(day, "EEEE, d 'de' MMMM yyyy", { locale: es })}
				{...navigation}
			/>
			<MealList
				meals={mealsOfDay(meals, day)}
				empty="No hay comidas este día"
			/>
		</>
	);
}

function WeekView({
	meals,
	anchor,
	inVisiblePeriod,
	...navigation
}: {
	meals: Meal[];
	anchor: Date;
	inVisiblePeriod: (day: Date) => boolean;
	onPrevious: () => void;
	onNext: () => void;
	canPrevious: boolean;
	canNext: boolean;
}) {
	const start = startOfWeek(anchor, { weekStartsOn: 1 });
	const end = endOfWeek(anchor, { weekStartsOn: 1 });
	const days = eachDayOfInterval({ start, end }).filter(inVisiblePeriod);

	return (
		<>
			<Navigator
				title={`${format(start, "d MMM", { locale: es })} – ${format(end, "d MMM yyyy", { locale: es })}`}
				{...navigation}
			/>
			{days.map((day) => {
				const dayMeals = mealsOfDay(meals, day);
				return (
					<section key={day.toISOString()} className="flex flex-col gap-3">
						<div className="flex items-center justify-between border-border border-b pb-2">
							<h2 className="font-medium text-sm capitalize">
								{format(day, "EEEE d", { locale: es })}
							</h2>
							<span className="text-muted-foreground text-xs">
								{dayMeals.length || "—"}
							</span>
						</div>
						{dayMeals.length > 0 ? (
							<MealList meals={dayMeals} empty="" />
						) : (
							<p className="py-1 text-muted-foreground text-xs">Sin comidas</p>
						)}
					</section>
				);
			})}
		</>
	);
}

const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

function MonthView({
	meals,
	selectedDay,
	onSelect,
	inVisiblePeriod,
	...navigation
}: {
	meals: Meal[];
	selectedDay: Date;
	onSelect: (day: Date) => void;
	inVisiblePeriod: (day: Date) => boolean;
	onPrevious: () => void;
	onNext: () => void;
	canPrevious: boolean;
	canNext: boolean;
}) {
	const month = startOfMonth(selectedDay);
	const calendarStart = startOfWeek(month, { weekStartsOn: 1 });
	const calendarEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
	const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

	return (
		<>
			<div className="rounded-2xl border bg-card p-3 shadow-sm">
				<Navigator
					title={format(month, "MMMM yyyy", { locale: es })}
					{...navigation}
				/>
				<div className="mt-2 grid grid-cols-7">
					{weekDays.map((day) => (
						<div
							key={day}
							className="pb-2 text-center font-medium text-muted-foreground text-xs"
						>
							{day}
						</div>
					))}
					{days.map((day) => {
						const count = mealsOfDay(meals, day).length;
						const selected = isSameDay(day, selectedDay);
						const available = inVisiblePeriod(day);
						return (
							<button
								key={day.toISOString()}
								type="button"
								onClick={() => onSelect(day)}
								disabled={!available}
								className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm ${
									selected
										? "bg-primary text-primary-foreground"
										: !available
											? "text-muted-foreground/20"
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
				<MealList
					meals={mealsOfDay(meals, selectedDay)}
					empty="No hay comidas este día"
				/>
			</section>
		</>
	);
}
