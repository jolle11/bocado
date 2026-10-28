import {
	Droplets,
	Sparkles,
	Star,
	Trash2,
	UtensilsCrossed,
} from "lucide-react";
import { Button } from "#/components/ui/button";
import { useDeleteMealTemplate, useMealTemplates } from "#/lib/queries";
import { MEAL_TYPE_LABELS, normalizeEntryType } from "#/lib/types";

export function TemplatesSection({ className = "" }: { className?: string }) {
	const { data: templates, isLoading } = useMealTemplates();
	const deleteTemplate = useDeleteMealTemplate();

	return (
		<section
			id="favoritos"
			className={`flex flex-col gap-3 lg:rounded-2xl lg:border lg:bg-card lg:p-5 lg:shadow-sm ${className}`}
		>
			<div className="flex items-center gap-2">
				<Star className="size-4 text-muted-foreground" />
				<div>
					<h2 className="font-medium">Favoritos</h2>
					<p className="text-muted-foreground text-sm">
						Guarda comidas habituales desde el formulario y repítelas con un
						toque.
					</p>
				</div>
			</div>
			{isLoading && <p className="text-muted-foreground text-sm">Cargando…</p>}
			{!isLoading && (templates?.length ?? 0) === 0 && (
				<p className="rounded-xl border border-dashed p-3 text-muted-foreground text-sm">
					Aún no tienes favoritos.
				</p>
			)}
			<ul className="flex flex-col gap-2">
				{templates?.map((template) => {
					const type = normalizeEntryType(template.entry_type);
					const Icon =
						type === "water"
							? Droplets
							: type === "extra"
								? Sparkles
								: UtensilsCrossed;
					return (
						<li
							key={template.id}
							className="flex items-center gap-3 rounded-xl border px-3 py-2"
						>
							<Icon className="size-4 shrink-0 text-muted-foreground" />
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium text-sm">{template.name}</p>
								<p className="truncate text-muted-foreground text-xs">
									{type === "water"
										? `${template.water_ml} ml`
										: [
												template.meal_type
													? MEAL_TYPE_LABELS[template.meal_type]
													: "",
												template.description,
											]
												.filter(Boolean)
												.join(" · ")}
								</p>
							</div>
							<Button
								variant="ghost"
								size="icon"
								aria-label={`Eliminar favorito ${template.name}`}
								disabled={deleteTemplate.isPending}
								onClick={() => deleteTemplate.mutate(template.id)}
							>
								<Trash2 className="size-4" />
							</Button>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
