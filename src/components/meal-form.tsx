import { useForm } from "@tanstack/react-form";
import { Camera, ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { optimizeImage } from "#/lib/optimize-image";
import { pb } from "#/lib/pocketbase";
import {
	MEAL_TYPE_LABELS,
	MEAL_TYPES,
	type MealForm as MealFormValues,
	type MealPhoto,
	mealFormSchema,
} from "#/lib/types";
import { useUploadThing } from "#/lib/uploadthing";
import { deleteUploadthingFiles } from "#/lib/uploadthing-files";

export function MealForm({
	initialValues,
	submitLabel,
	onSubmit,
}: {
	initialValues: MealFormValues;
	submitLabel: string;
	onSubmit: (values: MealFormValues) => Promise<void>;
}) {
	const { startUpload, isUploading } = useUploadThing("mealImage", {
		headers: () => ({
			Authorization: `Bearer ${pb.authStore.token}`,
		}),
	});
	const [existingPhotos, setExistingPhotos] = useState<MealPhoto[]>(
		initialValues.photos,
	);
	const [files, setFiles] = useState<File[]>([]);
	const [previews, setPreviews] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isOptimizing, setIsOptimizing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const fileInput = useRef<HTMLInputElement>(null);

	useEffect(
		() => () => {
			for (const preview of previews) URL.revokeObjectURL(preview);
		},
		[previews],
	);

	const form = useForm({
		defaultValues: initialValues,
		validators: { onSubmit: mealFormSchema },
		onSubmit: async ({ value }) => {
			setError(null);
			setIsSaving(true);
			let uploadedKeys: string[] = [];
			try {
				let uploaded: MealPhoto[] = [];
				if (files.length > 0) {
					const result = await startUpload(files);
					if (!result || result.length !== files.length) {
						throw new Error("upload failed");
					}
					uploaded = result.map((file) => ({
						url: file.ufsUrl,
						key: file.key,
					}));
					uploadedKeys = uploaded.map((photo) => photo.key);
				}
				const photos = [...existingPhotos, ...uploaded];
				await onSubmit({
					...value,
					photos,
					photo_url: photos[0]?.url ?? "",
					photo_key: photos[0]?.key ?? "",
				});

				const keptKeys = new Set(photos.map((photo) => photo.key));
				const removedKeys = initialValues.photos
					.map((photo) => photo.key)
					.filter((key) => key && !keptKeys.has(key));
				await deleteUploadthingFiles(removedKeys).catch((cleanupError) => {
					console.error("Could not delete removed photos", cleanupError);
				});
			} catch {
				await deleteUploadthingFiles(uploadedKeys).catch((cleanupError) => {
					console.error("Could not clean up failed uploads", cleanupError);
				});
				setError(
					"No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.",
				);
			} finally {
				setIsSaving(false);
			}
		},
	});

	const photoCount = existingPhotos.length + files.length;

	async function addFiles(event: React.ChangeEvent<HTMLInputElement>) {
		const picked = [...(event.target.files ?? [])].slice(0, 5 - photoCount);
		event.target.value = "";
		if (picked.length === 0) return;

		setIsOptimizing(true);
		setError(null);
		try {
			const optimized = await Promise.all(picked.map(optimizeImage));
			setFiles((current) => [...current, ...optimized]);
			setPreviews((current) => [
				...current,
				...optimized.map((file) => URL.createObjectURL(file)),
			]);
		} catch {
			setError("No se pudieron preparar las fotos. Inténtalo de nuevo.");
		} finally {
			setIsOptimizing(false);
		}
	}

	function removeNewPhoto(index: number) {
		URL.revokeObjectURL(previews[index]);
		setFiles((current) => current.filter((_, i) => i !== index));
		setPreviews((current) => current.filter((_, i) => i !== index));
	}

	const busy = isOptimizing || isUploading || isSaving;

	return (
		<form
			className="flex flex-col gap-6"
			onSubmit={(event) => {
				event.preventDefault();
				form.handleSubmit();
			}}
		>
			<div className="grid gap-2">
				<div className="flex items-center justify-between">
					<Label>Fotos</Label>
					<span className="text-muted-foreground text-xs">{photoCount}/5</span>
				</div>
				{photoCount > 0 && (
					<div className="grid grid-cols-2 gap-2">
						{existingPhotos.map((photo, index) => (
							<PhotoPreview
								key={photo.key || photo.url}
								src={photo.url}
								onRemove={() =>
									setExistingPhotos((current) =>
										current.filter((_, i) => i !== index),
									)
								}
							/>
						))}
						{previews.map((preview, index) => (
							<PhotoPreview
								key={preview}
								src={preview}
								onRemove={() => removeNewPhoto(index)}
							/>
						))}
					</div>
				)}
				{photoCount < 5 && (
					<button
						type="button"
						disabled={busy}
						onClick={() => fileInput.current?.click()}
						className="flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-xl border border-border border-dashed text-muted-foreground hover:bg-accent/50 disabled:opacity-50"
					>
						{photoCount === 0 ? (
							<Camera className="size-7" />
						) : (
							<ImagePlus className="size-7" />
						)}
						<span className="text-sm">
							{isOptimizing
								? "Optimizando fotos…"
								: photoCount === 0
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
					onChange={addFiles}
				/>
				<p className="text-muted-foreground text-xs">
					Puedes añadir hasta 5 fotos por comida.
				</p>
			</div>

			<form.Field name="meal_type">
				{(field) => (
					<div className="grid gap-2">
						<Label>Tipo</Label>
						<div className="flex flex-wrap gap-2">
							{MEAL_TYPES.map((type) => (
								<button
									key={type}
									type="button"
									onClick={() => field.handleChange(type)}
									className={`rounded-full border px-4 py-1.5 text-sm ${
										field.state.value === type
											? "border-primary bg-primary text-primary-foreground"
											: "border-border text-muted-foreground"
									}`}
								>
									{MEAL_TYPE_LABELS[type]}
								</button>
							))}
						</div>
					</div>
				)}
			</form.Field>

			<form.Field name="description">
				{(field) => (
					<div className="grid gap-2">
						<Label htmlFor="description">¿Qué has comido?</Label>
						<Textarea
							id="description"
							rows={4}
							value={field.state.value}
							onChange={(event) => field.handleChange(event.target.value)}
							placeholder="Lentejas con verduras, una manzana…"
						/>
						{field.state.meta.errors[0] && (
							<p className="text-destructive text-sm">
								{field.state.meta.errors[0]?.message}
							</p>
						)}
					</div>
				)}
			</form.Field>

			<form.Field name="eaten_at">
				{(field) => (
					<div className="grid gap-2">
						<Label htmlFor="eaten_at">¿Cuándo?</Label>
						<input
							id="eaten_at"
							type="datetime-local"
							className="h-10 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
							value={field.state.value}
							onChange={(event) => field.handleChange(event.target.value)}
						/>
					</div>
				)}
			</form.Field>

			{error && <p className="text-destructive text-sm">{error}</p>}

			<Button type="submit" size="lg" disabled={busy}>
				{busy ? "Guardando…" : submitLabel}
			</Button>
		</form>
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
