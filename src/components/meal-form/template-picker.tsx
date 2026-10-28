import { Star } from "lucide-react";
import { Label } from "#/components/ui/label";
import { useMealTemplates } from "#/lib/queries";
import { type MealTemplate, normalizeEntryType } from "#/lib/types";
import { ENTRY_TYPE_ICONS } from "./fields";

export function TemplatePicker({
	onPick,
}: {
	onPick: (template: MealTemplate) => void;
}) {
	const { data: templates } = useMealTemplates();
	if (!templates?.length) return null;

	return (
		<div className="grid gap-2">
			<Label className="flex items-center gap-1.5">
				<Star className="size-3.5" /> Favoritos
			</Label>
			<div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
				{templates.map((template) => {
					const Icon =
						ENTRY_TYPE_ICONS[normalizeEntryType(template.entry_type)];
					return (
						<button
							key={template.id}
							type="button"
							onClick={() => onPick(template)}
							className="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm hover:bg-accent"
						>
							<Icon className="size-3.5 text-muted-foreground" />
							<span className="max-w-40 truncate">{template.name}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
