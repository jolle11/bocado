import { useForm } from "@tanstack/react-form";
import {
	Camera,
	Droplets,
	ImagePlus,
	Minus,
	Plus,
	Sparkles,
	UtensilsCrossed,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { optimizeImage } from "#/lib/optimize-image";
import { pb } from "#/lib/pocketbase";
import {
	ENTRY_TYPE_LABELS,
	ENTRY_TYPES,
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
	const [entryType, setEntryType] = useState(initialValues.entry_type);
	const [finished, setFinished] = useState(initialValues.finished);
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
				if (value.entry_type === "meal" && files.length > 0) {
					const result = await startUpload(files);
					if (!result || result.length !== files.length) {
						throw new Error("upload failed");
					}
					uploaded = result.map((file) => file.serverData);
					uploadedKeys = uploaded.map((photo) => photo.key);
				}
				const photos =
					value.entry_type === "meal" ? [...existingPhotos, ...uploaded] : [];
				await onSubmit({
					...value,
					description:
						value.entry_type === "water" ? "Agua" : value.description.trim(),
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
			<form.Field name="entry_type">
				{(field) => (
					<div className="grid gap-2">
						<Label>¿Qué quieres añadir?</Label>
						<div className="grid grid-cols-3 rounded-xl bg-muted p-1">
							{ENTRY_TYPES.map((type) => {
								const Icon =
									type === "meal"
										? UtensilsCrossed
										: type === "water"
											? Droplets
											: Sparkles;
								return (
									<button
										key={type}
										type="button"
										onClick={() => {
											field.handleChange(type);
											setEntryType(type);
										}}
										className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-sm ${
											field.state.value === type
												? "bg-card font-medium shadow-sm"
												: "text-muted-foreground"
										}`}
									>
										<Icon className="size-4" />
										{ENTRY_TYPE_LABELS[type]}
									</button>
								);
							})}
						</div>
					</div>
				)}
			</form.Field>

			{entryType === "meal" && (
				<div className="grid gap-2">
					<div className="flex items-center justify-between">
						<Label>Fotos</Label>
						<span className="text-muted-foreground text-xs">
							{photoCount}/5
						</span>
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
			)}

			{entryType === "meal" && (
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
			)}

			{entryType === "water" ? (
				<form.Field name="water_ml">
					{(field) => (
						<div className="grid gap-2">
							<Label>¿Cuánta agua?</Label>
							<div className="rounded-2xl border bg-card p-5">
								<div className="flex items-center justify-center gap-6">
									<AmountButton
										label="Restar 250 ml"
										onClick={() =>
											field.handleChange(Math.max(250, field.state.value - 250))
										}
									>
										<Minus className="size-5" />
									</AmountButton>
									<div className="min-w-28 text-center">
										<Droplets className="mx-auto size-9 text-sky-500" />
										<p className="mt-1 font-semibold text-3xl">
											{formatWater(field.state.value)}
										</p>
										<p className="text-muted-foreground text-sm">de agua</p>
									</div>
									<AmountButton
										label="Sumar 250 ml"
										onClick={() =>
											field.handleChange(
												Math.min(10000, field.state.value + 250),
											)
										}
									>
										<Plus className="size-5" />
									</AmountButton>
								</div>
							</div>
							{field.state.meta.errors[0] && (
								<p className="text-destructive text-sm">
									{field.state.meta.errors[0]?.message}
								</p>
							)}
						</div>
					)}
				</form.Field>
			) : (
				<form.Field name="description">
					{(field) => (
						<div className="grid gap-2">
							<Label htmlFor="description">
								{entryType === "meal"
									? "¿Qué has comido?"
									: "¿Qué quieres anotar?"}
							</Label>
							<Textarea
								id="description"
								rows={4}
								value={field.state.value}
								onChange={(event) => field.handleChange(event.target.value)}
								placeholder={
									entryType === "meal"
										? "Lentejas con verduras, una manzana…"
										: "Un café, medicación, suplementos…"
								}
							/>
							{field.state.meta.errors[0] && (
								<p className="text-destructive text-sm">
									{field.state.meta.errors[0]?.message}
								</p>
							)}
						</div>
					)}
				</form.Field>
			)}

			{entryType === "meal" && (
				<div className="grid gap-3 rounded-xl border bg-card p-4">
					<form.Field name="finished">
						{(field) => (
							<div className="flex items-center justify-between gap-4">
								<div>
									<Label htmlFor="finished">Comida terminada</Label>
									<p className="mt-0.5 text-muted-foreground text-xs">
										Desactívalo si no te la has terminado.
									</p>
								</div>
								<button
									id="finished"
									type="button"
									role="switch"
									aria-checked={field.state.value}
									onClick={() => {
										const next = !field.state.value;
										field.handleChange(next);
										setFinished(next);
									}}
									className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
										field.state.value ? "bg-primary" : "bg-muted-foreground/35"
									}`}
								>
									<span
										aria-hidden="true"
										className={`absolute top-1 left-1 size-5 rounded-full bg-white shadow-sm transition-transform ${
											field.state.value ? "translate-x-5" : "translate-x-0"
										}`}
									/>
									<span className="sr-only">
										{field.state.value ? "Terminada" : "No terminada"}
									</span>
								</button>
							</div>
						)}
					</form.Field>

					{!finished && (
						<form.Field name="unfinished_note">
							{(field) => (
								<div className="grid gap-2 border-border border-t pt-3">
									<Label htmlFor="unfinished_note">
										¿Por qué no la has terminado?{" "}
										<span className="font-normal text-muted-foreground">
											(opcional)
										</span>
									</Label>
									<Textarea
										id="unfinished_note"
										rows={2}
										value={field.state.value}
										onChange={(event) => field.handleChange(event.target.value)}
										placeholder="Demasiada cantidad, no tenía hambre…"
									/>
									{field.state.meta.errors[0] && (
										<p className="text-destructive text-sm">
											{field.state.meta.errors[0]?.message}
										</p>
									)}
								</div>
							)}
						</form.Field>
					)}
				</div>
			)}

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
				{busy
					? "Guardando…"
					: submitLabel === "Guardar cambios"
						? submitLabel
						: `Guardar ${ENTRY_TYPE_LABELS[entryType].toLowerCase()}`}
			</Button>
		</form>
	);
}

function formatWater(ml: number) {
	if (ml >= 1000) {
		const liters = ml / 1000;
		return `${Number.isInteger(liters) ? liters : liters.toFixed(2)} l`;
	}
	return `${ml} ml`;
}

function AmountButton({
	label,
	children,
	onClick,
}: {
	label: string;
	children: React.ReactNode;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			onClick={onClick}
			className="flex size-11 items-center justify-center rounded-full border bg-card hover:bg-accent"
		>
			{children}
		</button>
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
