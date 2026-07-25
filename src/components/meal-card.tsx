import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent } from "#/components/ui/card";
import { MEAL_TYPE_LABELS, type Meal } from "#/lib/types";

export function MealCard({
	meal,
	onDelete,
}: {
	meal: Meal;
	onDelete?: (id: string) => void;
}) {
	return (
		<Card className="overflow-hidden py-0">
			{meal.photo_url && (
				<img
					src={meal.photo_url}
					alt={meal.description}
					className="aspect-video w-full object-cover"
					loading="lazy"
				/>
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
					</div>
					<p className="mt-2 whitespace-pre-wrap text-sm">{meal.description}</p>
				</div>
				{onDelete && (
					<button
						type="button"
						onClick={() => onDelete(meal.id)}
						className="text-muted-foreground transition-colors hover:text-destructive"
						aria-label="Borrar comida"
					>
						<Trash2 className="size-4" />
					</button>
				)}
			</CardContent>
		</Card>
	);
}
