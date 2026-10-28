import { Camera, ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Label } from "#/components/ui/label";
import { optimizeImage } from "#/lib/optimize-image";
import type { MealPhoto } from "#/lib/types";

export const MAX_PHOTOS = 5;

/** Estado de las fotos del formulario: las ya guardadas y las nuevas por subir. */
export function usePhotoDrafts(initialPhotos: MealPhoto[]) {
	const [existingPhotos, setExistingPhotos] = useState(initialPhotos);
	const [files, setFiles] = useState<File[]>([]);
	const [previews, setPreviews] = useState<string[]>([]);
	const [isOptimizing, setIsOptimizing] = useState(false);
	const previewsRef = useRef(previews);
	previewsRef.current = previews;

	useEffect(
		() => () => {
			for (const preview of previewsRef.current) URL.revokeObjectURL(preview);
		},
		[],
	);

	const count = existingPhotos.length + files.length;

	async function addFiles(picked: File[]) {
		const accepted = picked.slice(0, MAX_PHOTOS - count);
		if (accepted.length === 0) return;
		setIsOptimizing(true);
		try {
			const optimized = await Promise.all(accepted.map(optimizeImage));
			setFiles((current) => [...current, ...optimized]);
			setPreviews((current) => [
				...current,
				...optimized.map((file) => URL.createObjectURL(file)),
			]);
		} finally {
			setIsOptimizing(false);
		}
	}

	function removeExisting(index: number) {
		setExistingPhotos((current) => current.filter((_, i) => i !== index));
	}

	function removeNew(index: number) {
		URL.revokeObjectURL(previews[index]);
		setFiles((current) => current.filter((_, i) => i !== index));
		setPreviews((current) => current.filter((_, i) => i !== index));
	}

	return {
		existingPhotos,
		files,
		previews,
		count,
		isOptimizing,
		addFiles,
		removeExisting,
		removeNew,
	};
}

export type PhotoDrafts = ReturnType<typeof usePhotoDrafts>;

export function PhotoPicker({
	drafts,
	disabled,
	onError,
}: {
	drafts: PhotoDrafts;
	disabled: boolean;
	onError: (message: string | null) => void;
}) {
	const fileInput = useRef<HTMLInputElement>(null);
	const { count, existingPhotos, previews, isOptimizing } = drafts;

	async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		const picked = [...(event.target.files ?? [])];
		event.target.value = "";
		onError(null);
		try {
			await drafts.addFiles(picked);
		} catch {
			onError("No se pudieron preparar las fotos. Inténtalo de nuevo.");
		}
	}

	return (
		<div className="grid gap-2">
			<div className="flex items-center justify-between">
				<Label>Fotos</Label>
				<span className="text-muted-foreground text-xs">
					{count}/{MAX_PHOTOS}
				</span>
			</div>
			{count > 0 && (
				<div className="grid grid-cols-2 gap-2">
					{existingPhotos.map((photo, index) => (
						<PhotoPreview
							key={photo.key || photo.url}
							src={photo.url}
							onRemove={() => drafts.removeExisting(index)}
						/>
					))}
					{previews.map((preview, index) => (
						<PhotoPreview
							key={preview}
							src={preview}
							onRemove={() => drafts.removeNew(index)}
						/>
					))}
				</div>
			)}
			{count < MAX_PHOTOS && (
				<button
					type="button"
					disabled={disabled}
					onClick={() => fileInput.current?.click()}
					className="flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-xl border border-border border-dashed text-muted-foreground hover:bg-accent/50 disabled:opacity-50"
				>
					{count === 0 ? (
						<Camera className="size-7" />
					) : (
						<ImagePlus className="size-7" />
					)}
					<span className="text-sm">
						{isOptimizing
							? "Optimizando fotos…"
							: count === 0
								? "Hacer fotos o elegir de la galería"
								: "Añadir más fotos"}
					</span>
				</button>
			)}
			<input
				ref={fileInput}
				type="file"
				accept="image/*"
				multiple
				className="hidden"
				onChange={handleChange}
			/>
			<p className="text-muted-foreground text-xs">
				Puedes añadir hasta {MAX_PHOTOS} fotos por comida.
			</p>
		</div>
	);
}

function PhotoPreview({
	src,
	onRemove,
}: {
	src: string;
	onRemove: () => void;
}) {
	return (
		<div className="relative overflow-hidden rounded-xl">
			<img
				src={src}
				alt="Vista previa"
				className="aspect-video w-full object-cover"
				width={640}
				height={360}
				decoding="async"
			/>
			<button
				type="button"
				className="absolute top-2 right-2 rounded-full bg-black/65 p-1.5 text-white"
				onClick={onRemove}
				aria-label="Quitar foto"
			>
				<X className="size-4" />
			</button>
		</div>
	);
}
