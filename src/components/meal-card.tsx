import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Droplets, Images, Pencil, Sparkles, Trash2 } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent } from "#/components/ui/card";
import { useImagePreference } from "#/lib/preferences";
import { MEAL_TYPE_LABELS, type Meal, normalizeEntryType } from "#/lib/types";

export function MealCard({
	meal,
	onDelete,
}: {
	meal: Meal;
	onDelete?: (id: string) => void;
}) {
	const { showImages } = useImagePreference();
	const photos = meal.photos?.length
		? meal.photos
		: meal.photo_url
			? [{ url: meal.photo_url, key: meal.photo_key }]
			: [];
	const entryType = normalizeEntryType(meal.entry_type);

	if (entryType !== "meal") {
		return (
			<Card>
				<CardContent className="flex items-center gap-3 p-4">
					<div
						className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
							entryType === "water"
								? "bg-sky-500/10 text-sky-600"
								: "bg-amber-500/10 text-amber-600"
						}`}
					>
						{entryType === "water" ? (
							<Droplets className="size-5" />
						) : (
							<Sparkles className="size-5" />
						)}
					</div>
					<div className="min-w-0 flex-1">
						<p className="font-medium text-sm">
							{entryType === "water"
								? formatWater(meal.water_ml ?? 0)
								: meal.description}
						</p>
						<p className="text-muted-foreground text-xs">
							{entryType === "water" ? "Agua" : "Extra"} ·{" "}
							{format(new Date(meal.eaten_at), "HH:mm")}
						</p>
					</div>
					{onDelete && <EntryActions mealId={meal.id} onDelete={onDelete} />}
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="overflow-hidden py-0">
			{showImages && photos.length > 0 && (
				<div
					className={
						photos.length === 1 ? "" : "grid grid-cols-2 gap-0.5 bg-border"
					}
				>
					{photos.map((photo, index) => (
						<div
							key={photo.key || photo.url}
							className={photos.length === 3 && index === 0 ? "col-span-2" : ""}
						>
							<img
								src={photo.url}
								alt={`${meal.description}, foto ${index + 1}`}
								className="aspect-video h-full w-full object-cover"
								loading="lazy"
							/>
						</div>
					))}
				</div>
			)}
			<CardContent className="flex items-start gap-3 p-4">
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<Badge variant="secondary">
							{MEAL_TYPE_LABELS[meal.meal_type] ?? meal.meal_type}
						</Badge>
						<span className="text-muted-foreground text-sm">
							{format(new Date(meal.eaten_at), "HH:mm")}
						</span>
						{!showImages && photos.length > 0 && (
							<span
								className="flex items-center gap-1 text-muted-foreground text-xs"
								title={`${photos.length} fotos ocultas`}
							>
								<Images className="size-3.5" />
								{photos.length}
							</span>
						)}
					</div>
					<p className="mt-2 whitespace-pre-wrap text-sm">{meal.description}</p>
				</div>
				{onDelete && <EntryActions mealId={meal.id} onDelete={onDelete} />}
			</CardContent>
		</Card>
	);
}

function formatWater(ml: number) {
	if (ml >= 1000) {
		const liters = ml / 1000;
		return `${Number.isInteger(liters) ? liters : liters.toFixed(2)} l de agua`;
	}
	return `${ml} ml de agua`;
}

function EntryActions({
	mealId,
	onDelete,
}: {
	mealId: string;
	onDelete: (id: string) => void;
}) {
	return (
		<div className="flex shrink-0 gap-1">
			<Link
				to="/edit/$mealId"
				params={{ mealId }}
				className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
				aria-label="Editar entrada"
			>
				<Pencil className="size-4" />
			</Link>
			<button
				type="button"
				onClick={() => onDelete(mealId)}
				className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-destructive"
				aria-label="Borrar entrada"
			>
				<Trash2 className="size-4" />
			</button>
		</div>
	);
}
