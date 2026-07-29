import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CircleAlert, Droplets, Pencil, Sparkles, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	ENTRY_TYPE_LABELS,
	MEAL_TYPE_LABELS,
	type Meal,
	normalizeEntryType,
} from "#/lib/types";

export function MealPreviewDialog({
	meal,
	open,
	onOpenChange,
}: {
	meal: Meal;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const entryType = normalizeEntryType(meal.entry_type);
	const photos = meal.photos?.length
		? meal.photos
		: meal.photo_url
			? [{ url: meal.photo_url, key: meal.photo_key }]
			: [];

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content
					className="fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-2xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
					aria-describedby={undefined}
				>
					<div className="flex items-center justify-between border-b px-4 py-3">
						<div>
							<Dialog.Title className="font-semibold">
								Vista previa
							</Dialog.Title>
							<p className="text-muted-foreground text-xs capitalize">
								{format(new Date(meal.eaten_at), "EEEE, d 'de' MMMM · HH:mm", {
									locale: es,
								})}
							</p>
						</div>
						<Dialog.Close asChild>
							<Button
								variant="ghost"
								size="icon"
								aria-label="Cerrar vista previa"
							>
								<X className="size-5" />
							</Button>
						</Dialog.Close>
					</div>

					<div className="min-h-0 overflow-y-auto">
						{photos.length > 0 && (
							<div className="flex flex-col gap-1 bg-black">
								{photos.map((photo, index) => (
									<img
										key={photo.key || photo.url}
										src={photo.url}
										alt={`${meal.description || ENTRY_TYPE_LABELS[entryType]}, foto ${index + 1}`}
										className="max-h-[60dvh] w-full object-contain"
										loading="lazy"
										decoding="async"
									/>
								))}
							</div>
						)}

						<div className="space-y-4 p-5">
							<div className="flex flex-wrap items-center gap-2">
								{entryType === "meal" ? (
									<Badge variant="secondary">
										{MEAL_TYPE_LABELS[meal.meal_type] ?? meal.meal_type}
									</Badge>
								) : (
									<Badge variant="secondary">
										{entryType === "water" ? (
											<Droplets className="size-3.5" />
										) : (
											<Sparkles className="size-3.5" />
										)}
										{ENTRY_TYPE_LABELS[entryType]}
									</Badge>
								)}
								{meal.unfinished && (
									<Badge
										variant="outline"
										className="border-amber-300 text-amber-700 dark:text-amber-400"
									>
										<CircleAlert className="size-3.5" />
										No terminada
									</Badge>
								)}
							</div>

							<p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
								{entryType === "water"
									? formatWater(meal.water_ml ?? 0)
									: meal.description}
							</p>

							{meal.unfinished_note && (
								<div className="rounded-xl bg-amber-500/10 p-3">
									<p className="mb-1 font-medium text-amber-800 text-xs dark:text-amber-300">
										Nota
									</p>
									<p className="whitespace-pre-wrap break-words text-sm">
										{meal.unfinished_note}
									</p>
								</div>
							)}
						</div>
					</div>

					<div className="flex justify-end gap-2 border-t p-4">
						<Dialog.Close asChild>
							<Button variant="outline">Cerrar</Button>
						</Dialog.Close>
						<Button asChild>
							<Link to="/edit/$mealId" params={{ mealId: meal.id }}>
								<Pencil className="size-4" />
								Editar
							</Link>
						</Button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

function formatWater(ml: number) {
	if (ml >= 1000) {
		const liters = ml / 1000;
		return `${Number.isInteger(liters) ? liters : liters.toFixed(2)} l de agua`;
	}
	return `${ml} ml de agua`;
}
