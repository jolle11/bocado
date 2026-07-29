import { Sparkles } from "lucide-react";
import type { ExtraStats } from "#/lib/extra-stats";

export function ExtraSummary({
	stats,
	period,
	isLoading = false,
}: {
	stats: ExtraStats;
	period: "semana" | "mes";
	isLoading?: boolean;
}) {
	if (isLoading) {
		return (
			<div className="h-[104px] animate-pulse rounded-xl border bg-muted/40" />
		);
	}

	return (
		<section
			className="rounded-xl border bg-card p-4 shadow-sm"
			aria-label={`Resumen de extras del ${period}`}
		>
			<div className="flex items-center gap-3">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
					<Sparkles className="size-5" />
				</div>
				<div>
					<p className="font-semibold text-lg">
						{stats.extras} {stats.extras === 1 ? "extra" : "extras"}
					</p>
					<p className="text-muted-foreground text-xs">Este {period}</p>
				</div>
			</div>
			<div className="mt-4 grid grid-cols-2 gap-3 border-border border-t pt-3 text-sm">
				<p>
					<span className="font-medium">{stats.daysWithoutExtras}</span>
					<span className="text-muted-foreground">
						{" "}
						de {stats.totalDays} días sin extras
					</span>
				</p>
				<p className="text-right text-muted-foreground">
					{comparisonLabel(stats.difference, period)}
				</p>
			</div>
		</section>
	);
}

function comparisonLabel(difference: number, period: "semana" | "mes") {
	const previousPeriod =
		period === "semana" ? "la semana anterior" : "el mes anterior";
	if (difference === 0) return `Igual que ${previousPeriod}`;

	const amount = Math.abs(difference);
	return `${amount} ${amount === 1 ? "extra" : "extras"} ${
		difference < 0 ? "menos" : "más"
	} que ${previousPeriod}`;
}
