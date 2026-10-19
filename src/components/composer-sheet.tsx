import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { EditMealEditor, NewMealEditor } from "#/components/meal-editors";
import type { ComposerSearch } from "#/lib/composer";

/** Panel lateral de escritorio para crear o editar sin salir de la vista. */
export function ComposerSheet({
	search,
	onClose,
}: {
	search: ComposerSearch;
	onClose: () => void;
}) {
	const open = search.compose === "new" || Boolean(search.edit);
	const title = search.edit ? "Editar entrada" : "Nueva comida";

	return (
		<Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content
					className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l bg-background shadow-2xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
					aria-describedby={undefined}
					onInteractOutside={(event) => {
						if (!window.confirm("¿Cerrar sin guardar?")) event.preventDefault();
					}}
				>
					<div className="flex items-center justify-between border-b px-6 py-4">
						<Dialog.Title className="font-semibold text-lg">
							{title}
						</Dialog.Title>
						<Dialog.Close
							className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
							aria-label="Cerrar"
						>
							<X className="size-4" />
						</Dialog.Close>
					</div>
					<div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
						{search.edit ? (
							<EditMealEditor
								key={search.edit}
								mealId={search.edit}
								onDone={onClose}
							/>
						) : (
							open && (
								<NewMealEditor
									key={`${search.composeDate}-${search.composeType}`}
									date={search.composeDate}
									mealType={search.composeType}
									onDone={onClose}
								/>
							)
						)}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
