import { Droplets } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	useWaterGoalPreference,
	WATER_GOAL_MAX_ML,
	WATER_GOAL_MIN_ML,
} from "#/lib/preferences";

const PRESETS = [1500, 2000, 2500, 3000];

export function WaterGoalSection({ className = "" }: { className?: string }) {
	const { waterGoal, setWaterGoal } = useWaterGoalPreference();

	return (
		<section
			id="agua"
			className={`flex flex-col gap-3 lg:rounded-2xl lg:border lg:bg-card lg:p-5 lg:shadow-sm ${className}`}
		>
			<div className="flex items-center gap-2">
				<Droplets className="size-4 text-muted-foreground" />
				<div>
					<h2 className="font-medium">Objetivo diario de agua</h2>
					<p className="text-muted-foreground text-sm">
						Muestra tu progreso de hidratación en la pantalla de hoy.
					</p>
				</div>
			</div>
			<Button
				variant="outline"
				className="justify-start"
				aria-pressed={waterGoal.enabled}
				onClick={() =>
					setWaterGoal({ ...waterGoal, enabled: !waterGoal.enabled })
				}
			>
				<Droplets className="size-4" />
				{waterGoal.enabled ? "Desactivar objetivo" : "Activar objetivo"}
			</Button>
			{waterGoal.enabled && (
				<div className="flex flex-col gap-2 rounded-xl border p-3">
					<div className="grid grid-cols-4 gap-2">
						{PRESETS.map((ml) => (
							<button
								key={ml}
								type="button"
								onClick={() => setWaterGoal({ ...waterGoal, ml })}
								className={`rounded-lg border px-2 py-1.5 text-sm ${
									waterGoal.ml === ml
										? "border-primary bg-primary/10 font-medium text-primary"
										: "text-muted-foreground"
								}`}
							>
								{(ml / 1000).toLocaleString("es-ES")} L
							</button>
						))}
					</div>
					<div className="flex items-center gap-2">
						<Label htmlFor="water-goal-ml" className="shrink-0">
							Otro (ml)
						</Label>
						<Input
							id="water-goal-ml"
							type="number"
							inputMode="numeric"
							min={WATER_GOAL_MIN_ML}
							max={WATER_GOAL_MAX_ML}
							step={50}
							defaultValue={waterGoal.ml}
							key={waterGoal.ml}
							onBlur={(event) => {
								const ml = Number(event.target.value);
								if (Number.isFinite(ml) && ml > 0)
									setWaterGoal({ ...waterGoal, ml });
							}}
						/>
					</div>
				</div>
			)}
		</section>
	);
}
