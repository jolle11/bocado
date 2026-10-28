import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { pb } from "#/lib/pocketbase";
import { useCreateMealTemplate } from "#/lib/queries";
import {
	ENTRY_TYPE_LABELS,
	type MealForm as MealFormValues,
	type MealPhoto,
	type MealTemplate,
	mealFormSchema,
	normalizeEntryType,
	templateNameFrom,
} from "#/lib/types";
import { useUploadThing } from "#/lib/uploadthing";
import { deleteUploadthingFiles } from "#/lib/uploadthing-files";
import {
	EntryTypePicker,
	FieldError,
	MealTypePicker,
	Switch,
	WaterAmountField,
} from "./fields";
import { PhotoPicker, usePhotoDrafts } from "./photo-picker";
import { TemplatePicker } from "./template-picker";

export function MealForm({
	initialValues,
	submitLabel,
	onSubmit,
	showTemplates = false,
}: {
	initialValues: MealFormValues;
	submitLabel: string;
	onSubmit: (values: MealFormValues) => Promise<void>;
	/** Muestra los favoritos para rellenar el formulario (solo al crear). */
	showTemplates?: boolean;
}) {
	const { startUpload, isUploading } = useUploadThing("mealImage", {
		headers: () => ({
			Authorization: `Bearer ${pb.authStore.token}`,
		}),
	});
	const photos = usePhotoDrafts(initialValues.photos);
	const createTemplate = useCreateMealTemplate();
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [entryType, setEntryType] = useState(initialValues.entry_type);
	const [finished, setFinished] = useState(initialValues.finished);
	const [saveAsTemplate, setSaveAsTemplate] = useState(false);
	const [templateName, setTemplateName] = useState("");

	const form = useForm({
		defaultValues: initialValues,
		validators: { onSubmit: mealFormSchema },
		onSubmit: async ({ value }) => {
			setError(null);
			setIsSaving(true);
			let uploadedKeys: string[] = [];
			try {
				let uploaded: MealPhoto[] = [];
				if (value.entry_type === "meal" && photos.files.length > 0) {
					const result = await startUpload(photos.files);
					if (!result || result.length !== photos.files.length) {
						throw new Error("upload failed");
					}
					uploaded = result.map((file) => file.serverData);
					uploadedKeys = uploaded.map((photo) => photo.key);
				}
				const savedPhotos =
					value.entry_type === "meal"
						? [...photos.existingPhotos, ...uploaded]
						: [];
				const description =
					value.entry_type === "water" ? "Agua" : value.description.trim();
				await onSubmit({
					...value,
					description,
					photos: savedPhotos,
					photo_url: savedPhotos[0]?.url ?? "",
					photo_key: savedPhotos[0]?.key ?? "",
				});
				uploadedKeys = [];

				if (saveAsTemplate) {
					await createTemplate
						.mutateAsync({
							name:
								templateName.trim() ||
								templateNameFrom(description, "Favorito"),
							entry_type: value.entry_type,
							meal_type: value.entry_type === "meal" ? value.meal_type : "",
							description: value.entry_type === "water" ? "" : description,
							water_ml: value.entry_type === "water" ? value.water_ml : 0,
						})
						.catch((templateError) => {
							console.error("Could not save template", templateError);
						});
				}

				const keptKeys = new Set(savedPhotos.map((photo) => photo.key));
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

	function applyTemplate(template: MealTemplate) {
		const type = normalizeEntryType(template.entry_type);
		form.setFieldValue("entry_type", type);
		setEntryType(type);
		if (template.meal_type) form.setFieldValue("meal_type", template.meal_type);
		if (type === "water") {
			form.setFieldValue("water_ml", template.water_ml || 250);
		} else {
			form.setFieldValue("description", template.description);
		}
	}

	const busy = photos.isOptimizing || isUploading || isSaving;

	return (
		<form
			className="flex flex-col gap-6"
			onSubmit={(event) => {
				event.preventDefault();
				form.handleSubmit();
			}}
		>
			{showTemplates && <TemplatePicker onPick={applyTemplate} />}

			<form.Field name="entry_type">
				{(field) => (
					<EntryTypePicker
						value={field.state.value}
						onChange={(type) => {
							field.handleChange(type);
							setEntryType(type);
						}}
					/>
				)}
			</form.Field>

			{entryType === "meal" && (
				<PhotoPicker drafts={photos} disabled={busy} onError={setError} />
			)}

			{entryType === "meal" && (
				<form.Field name="meal_type">
					{(field) => (
						<MealTypePicker
							value={field.state.value}
							onChange={field.handleChange}
						/>
					)}
				</form.Field>
			)}

			{entryType === "water" ? (
				<form.Field name="water_ml">
					{(field) => (
						<WaterAmountField
							value={field.state.value}
							onChange={field.handleChange}
							error={field.state.meta.errors[0]?.message}
						/>
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
							<FieldError message={field.state.meta.errors[0]?.message} />
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
								<Switch
									id="finished"
									checked={field.state.value}
									onLabel="Terminada"
									offLabel="No terminada"
									onChange={(next) => {
										field.handleChange(next);
										setFinished(next);
									}}
								/>
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
									<FieldError message={field.state.meta.errors[0]?.message} />
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

			<div className="grid gap-3 rounded-xl border bg-card p-4">
				<div className="flex items-center justify-between gap-4">
					<div>
						<Label htmlFor="save-template">Guardar como favorito</Label>
						<p className="mt-0.5 text-muted-foreground text-xs">
							Para repetirla con un toque la próxima vez.
						</p>
					</div>
					<Switch
						id="save-template"
						checked={saveAsTemplate}
						onLabel="Se guardará como favorito"
						offLabel="No se guardará como favorito"
						onChange={setSaveAsTemplate}
					/>
				</div>
				{saveAsTemplate && (
					<div className="grid gap-2 border-border border-t pt-3">
						<Label htmlFor="template-name">
							Nombre{" "}
							<span className="font-normal text-muted-foreground">
								(opcional)
							</span>
						</Label>
						<Input
							id="template-name"
							maxLength={80}
							value={templateName}
							onChange={(event) => setTemplateName(event.target.value)}
							placeholder="Desayuno de diario"
						/>
					</div>
				)}
			</div>

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
