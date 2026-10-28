import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BarChart3 } from "lucide-react";
import { formatWater } from "#/components/meal-form/fields";
import { MEAL_TYPE_LABELS } from "#/lib/types";
import { MAIN_MEALS, type WeeklyStats } from "#/lib/weekly-stats";

export function WeeklyStatsCard({
	stats,
	waterGoalMl,
	isLoading = false,
}: {
	stats: WeeklyStats;
	waterGoalMl: number | null;
	isLoading?: boolean;
}) {
	if (isLoading) {
		return <div className="h-64 animate-pulse rounded-xl border bg-muted/40" />;
	}

	const maxWater = Math.max(
		waterGoalMl ?? 0,
		...stats.days.map((day) => day.waterMl),
		1,
	);
	const skipped = MAIN_MEALS.filter((type) => stats.skippedMainMeals[type] > 0);

	return (
		<section
			className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm"
			aria-label="Estadísticas de la semana"
		>
			<div className="flex items-center gap-3">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<BarChart3 className="size-5" />
				</div>
				<div>
					<p className="font-semibold text-lg">
						{stats.daysLogged} de {stats.elapsedDays} días registrados
					</p>
					<p className="text-muted-foreground text-xs">
						{stats.meals} {stats.meals === 1 ? "comida" : "comidas"}
						{stats.unfinished > 0 && ` · ${stats.unfinished} sin terminar`}
					</p>
				</div>
			</div>

			<div>
				<div className="mb-2 flex items-baseline justify-between text-sm">
					<span className="font-medium">Agua</span>
					<span className="text-muted-foreground text-xs">
						Media {formatWater(stats.averageWaterMl)}/día
						{stats.daysMeetingWaterGoal !== null &&
							` · objetivo ${stats.daysMeetingWaterGoal}/${stats.elapsedDays}`}
					</span>
				</div>
				<ul className="relative flex h-24 items-end gap-1.5">
					{waterGoalMl && (
						<div
							aria-hidden="true"
							className="pointer-events-none absolute inset-x-0 border-sky-500/60 border-t border-dashed"
							style={{ bottom: `${(waterGoalMl / maxWater) * 100}%` }}
						/>
					)}
					{stats.days.map((day) => (
						<li
							key={day.date.toISOString()}
							aria-label={`${format(day.date, "EEEE", { locale: es })}: ${formatWater(day.waterMl)}`}
							className="flex h-full flex-1 flex-col justify-end"
						>
							<div
								className={`rounded-t-md ${
									day.future
										? "bg-muted"
										: waterGoalMl && day.waterMl >= waterGoalMl
											? "bg-sky-500"
											: "bg-sky-500/45"
								}`}
								style={{
									height: `${Math.max(day.future ? 4 : 2, (day.waterMl / maxWater) * 100)}%`,
								}}
							/>
						</li>
					))}
				</ul>
				<div className="mt-1 flex gap-1.5">
					{stats.days.map((day) => (
						<span
							key={day.date.toISOString()}
							className="flex-1 text-center text-[10px] text-muted-foreground uppercase"
						>
							{format(day.date, "EEEEE", { locale: es })}
						</span>
					))}
				</div>
			</div>

			<div className="grid grid-cols-3 gap-2 border-border border-t pt-3 text-center">
				{MAIN_MEALS.map((type) => (
					<div key={type}>
						<p className="text-muted-foreground text-xs">
							{MEAL_TYPE_LABELS[type]}
						</p>
						<p className="font-medium text-sm">
							{stats.typicalTimes[type] ?? "—"}
						</p>
					</div>
				))}
			</div>
			<p className="text-muted-foreground text-xs">
				{skipped.length === 0
					? "No te has saltado ninguna comida principal."
					: `Sin registrar: ${skipped
							.map(
								(type) =>
									`${MEAL_TYPE_LABELS[type].toLowerCase()} (${stats.skippedMainMeals[type]})`,
							)
							.join(", ")}.`}
			</p>
		</section>
	);
}
