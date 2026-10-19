import { X } from "lucide-react";
import { Dialog } from "radix-ui";

export function Kbd({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<kbd
			className={`inline-flex h-5 min-w-5 items-center justify-center rounded border border-border px-1.5 font-mono text-[10px] text-muted-foreground ${className}`}
		>
			{children}
		</kbd>
	);
}

const SHORTCUTS = [
	{ keys: ["N"], label: "Añadir comida" },
	{ keys: ["←", "→"], label: "Semana o mes anterior / siguiente" },
	{ keys: ["["], label: "Colapsar o expandir el menú" },
	{ keys: ["Esc"], label: "Cerrar panel o diálogo" },
	{ keys: ["?"], label: "Ver esta ayuda" },
];

export function ShortcutsDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content
					className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-card p-5 text-card-foreground shadow-2xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
					aria-describedby={undefined}
				>
					<div className="mb-4 flex items-center justify-between">
						<Dialog.Title className="font-semibold">
							Atajos de teclado
						</Dialog.Title>
						<Dialog.Close
							className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
							aria-label="Cerrar"
						>
							<X className="size-4" />
						</Dialog.Close>
					</div>
					<ul className="flex flex-col gap-2.5">
						{SHORTCUTS.map((shortcut) => (
							<li
								key={shortcut.label}
								className="flex items-center justify-between gap-4 text-sm"
							>
								<span className="text-muted-foreground">{shortcut.label}</span>
								<span className="flex gap-1">
									{shortcut.keys.map((key) => (
										<Kbd key={key}>{key}</Kbd>
									))}
								</span>
							</li>
						))}
					</ul>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
