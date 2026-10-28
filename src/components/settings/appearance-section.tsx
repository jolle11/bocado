import { Monitor, Moon, Palette, Sun } from "lucide-react";
import { THEME_PALETTES, useTheme } from "#/lib/preferences";

export function AppearanceSection({ className = "" }: { className?: string }) {
	const { palette, mode, setPalette, setMode } = useTheme();

	return (
		<section
			id="apariencia"
			className={`flex flex-col gap-3 lg:rounded-2xl lg:border lg:bg-card lg:p-5 lg:shadow-sm ${className}`}
		>
			<div className="flex items-center gap-2">
				<Palette className="size-4 text-muted-foreground" />
				<h2 className="font-medium">Apariencia</h2>
			</div>
			<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
				{THEME_PALETTES.map((option) => (
					<button
						key={option.id}
						type="button"
						onClick={() => setPalette(option.id)}
						className={`flex min-w-0 flex-col items-center gap-2 rounded-xl border p-2 text-xs ${
							palette === option.id
								? "border-primary bg-primary/10 text-primary"
								: "border-border text-muted-foreground"
						}`}
					>
						<span
							className="size-7 rounded-full border border-black/10 shadow-sm"
							style={{ backgroundColor: option.swatch }}
						/>
						<span className="w-full min-w-0 whitespace-nowrap text-center leading-tight">
							{option.label}
						</span>
					</button>
				))}
			</div>
			<div className="grid grid-cols-3 rounded-xl bg-muted p-1">
				<button
					type="button"
					onClick={() => setMode("system")}
					className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm ${
						mode === "system"
							? "bg-card font-medium text-foreground shadow-sm"
							: "text-muted-foreground"
					}`}
				>
					<Monitor className="size-4" /> Automático
				</button>
				<button
					type="button"
					onClick={() => setMode("light")}
					className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm ${
						mode === "light"
							? "bg-card font-medium text-foreground shadow-sm"
							: "text-muted-foreground"
					}`}
				>
					<Sun className="size-4" /> Claro
				</button>
				<button
					type="button"
					onClick={() => setMode("dark")}
					className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm ${
						mode === "dark"
							? "bg-card font-medium text-foreground shadow-sm"
							: "text-muted-foreground"
					}`}
				>
					<Moon className="size-4" /> Oscuro
				</button>
			</div>
		</section>
	);
}
