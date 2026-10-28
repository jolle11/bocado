import { Eye, EyeOff } from "lucide-react";
import { Button } from "#/components/ui/button";
import { useImagePreference } from "#/lib/preferences";

export function PhotosSection({ className = "" }: { className?: string }) {
	const { showImages, setShowImages } = useImagePreference();

	return (
		<section
			id="fotos"
			className={`flex flex-col gap-3 lg:rounded-2xl lg:border lg:bg-card lg:p-5 lg:shadow-sm ${className}`}
		>
			<div>
				<h2 className="font-medium">Fotos en el diario</h2>
				<p className="text-muted-foreground text-sm">
					Ocúltalas para ver más comidas a la vez. No se borrará ninguna.
				</p>
			</div>
			<Button
				variant="outline"
				onClick={() => setShowImages(!showImages)}
				className="justify-start"
			>
				{showImages ? (
					<Eye className="size-4" />
				) : (
					<EyeOff className="size-4" />
				)}
				{showImages ? "Las fotos están visibles" : "Las fotos están ocultas"}
			</Button>
		</section>
	);
}
