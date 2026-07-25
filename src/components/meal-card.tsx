import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Images, Pencil, Trash2 } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent } from "#/components/ui/card";
import { useImagePreference } from "#/lib/preferences";
import { MEAL_TYPE_LABELS, type Meal } from "#/lib/types";

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
				{onDelete && (
					<div className="flex shrink-0 gap-1">
						<Link
							to="/editar/$mealId"
							params={{ mealId: meal.id }}
							className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
							aria-label="Editar comida"
						>
							<Pencil className="size-4" />
						</Link>
						<button
							type="button"
							onClick={() => onDelete(meal.id)}
							className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-destructive"
							aria-label="Borrar comida"
						>
							<Trash2 className="size-4" />
						</button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
