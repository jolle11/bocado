import { Eye, EyeOff, Moon, Sun } from "lucide-react";
import { useImagePreference, useTheme } from "#/lib/preferences";

export function DisplayControls({
	showImageToggle = true,
}: {
	showImageToggle?: boolean;
}) {
	const { showImages, setShowImages } = useImagePreference();
	const { resolvedMode, setMode } = useTheme();
	const isDark = resolvedMode === "dark";

	return (
		<fieldset className="flex items-center gap-1 rounded-full border border-border bg-card/90 p-1 shadow-sm backdrop-blur">
			<legend className="sr-only">Controles de visualización</legend>
			{showImageToggle && (
				<button
					type="button"
					onClick={() => setShowImages(!showImages)}
					className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
					aria-label={showImages ? "Ocultar imágenes" : "Mostrar imágenes"}
					title={showImages ? "Ocultar imágenes" : "Mostrar imágenes"}
				>
					{showImages ? (
						<Eye className="size-4" />
					) : (
						<EyeOff className="size-4" />
					)}
				</button>
			)}
			<button
				type="button"
				onClick={() => setMode(isDark ? "light" : "dark")}
				className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
				aria-label={isDark ? "Activar tema claro" : "Activar tema oscuro"}
				title={isDark ? "Activar tema claro" : "Activar tema oscuro"}
			>
				{isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
			</button>
		</fieldset>
	);
}
