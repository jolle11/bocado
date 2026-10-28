import { Droplets } from "lucide-react";
import { formatWater } from "#/components/meal-form/fields";

export function WaterGoalProgress({
	waterMl,
	goalMl,
}: {
	waterMl: number;
	goalMl: number | null;
}) {
	const progress = goalMl ? Math.min(1, waterMl / goalMl) : 0;
	const reached = goalMl !== null && waterMl >= goalMl;

	return (
		<section className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm">
			<div className="flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
					<Droplets className="size-5" />
				</div>
				<div className="flex-1">
					<p className="font-medium">
						{formatWater(waterMl)}
						{goalMl !== null && (
							<span className="font-normal text-muted-foreground">
								{" "}
								/ {formatWater(goalMl)}
							</span>
						)}
					</p>
					<p className="text-muted-foreground text-xs">
						{goalMl === null
							? "Agua hoy"
							: reached
								? "¡Objetivo de agua cumplido! 🎉"
								: `Te faltan ${formatWater(goalMl - waterMl)}`}
					</p>
				</div>
			</div>
			{goalMl !== null && (
				<div
					role="progressbar"
					aria-label="Progreso del objetivo de agua"
					aria-valuemin={0}
					aria-valuemax={goalMl}
					aria-valuenow={waterMl}
					className="h-2 overflow-hidden rounded-full bg-sky-500/15"
				>
					<div
						className="h-full rounded-full bg-sky-500 transition-[width]"
						style={{ width: `${progress * 100}%` }}
					/>
				</div>
			)}
		</section>
	);
}
