import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { Camera, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { useCreateMeal } from "#/lib/queries";
import {
	MEAL_TYPE_LABELS,
	MEAL_TYPES,
	type MealType,
	mealFormSchema,
} from "#/lib/types";
import { useUploadThing } from "#/lib/uploadthing";

export const Route = createFileRoute("/_app/nueva")({ component: NewMealPage });

function suggestMealType(): MealType {
	const h = new Date().getHours();
	if (h < 11) return "desayuno";
	if (h < 13) return "almuerzo";
	if (h < 16) return "comida";
	if (h < 19) return "merienda";
	if (h < 23) return "cena";
	return "snack";
}

function NewMealPage() {
	const navigate = useNavigate();
	const createMeal = useCreateMeal();
	const { startUpload, isUploading } = useUploadThing("mealImage");
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const fileInput = useRef<HTMLInputElement>(null);

	const form = useForm({
		defaultValues: {
			description: "",
			meal_type: suggestMealType() as MealType,
			eaten_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
			photo_url: "",
			photo_key: "",
		},
		validators: { onSubmit: mealFormSchema },
		onSubmit: async ({ value }) => {
			setError(null);
			try {
				let photo_url = "";
				let photo_key = "";
				if (file) {
					const res = await startUpload([file]);
					const uploaded = res?.[0];
					if (!uploaded) throw new Error("upload failed");
					photo_url = uploaded.ufsUrl;
					photo_key = uploaded.key;
				}
				await createMeal.mutateAsync({ ...value, photo_url, photo_key });
				navigate({ to: "/" });
			} catch {
				setError(
					"No se pudo guardar. Revisa tu conexión (y el token de UploadThing si subes foto).",
				);
			}
		},
	});

	function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
		const picked = e.target.files?.[0] ?? null;
		setFile(picked);
		setPreview(picked ? URL.createObjectURL(picked) : null);
	}

	const busy = isUploading || createMeal.isPending;

	return (
		<form
			className="flex flex-col gap-6"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<header className="pt-2">
				<h1 className="font-semibold text-2xl">Nueva comida</h1>
			</header>

			<div className="grid gap-2">
				<Label>Foto</Label>
				{preview ? (
					<div className="relative">
						<img
							src={preview}
							alt="Vista previa"
							className="aspect-video w-full rounded-xl object-cover"
						/>
						<button
							type="button"
							className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white"
							onClick={() => {
								setFile(null);
								setPreview(null);
								if (fileInput.current) fileInput.current.value = "";
							}}
							aria-label="Quitar foto"
						>
							<X className="size-4" />
						</button>
					</div>
				) : (
					<button
						type="button"
						onClick={() => fileInput.current?.click()}
						className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-border border-dashed text-muted-foreground"
					>
						<Camera className="size-8" />
						<span className="text-sm">Hacer foto o elegir de la galería</span>
					</button>
				)}
				<input
					ref={fileInput}
					type="file"
					accept="image/*"
					capture="environment"
					className="hidden"
					onChange={onPickFile}
				/>
			</div>

			<form.Field name="meal_type">
				{(field) => (
					<div className="grid gap-2">
						<Label>Tipo</Label>
						<div className="flex flex-wrap gap-2">
							{MEAL_TYPES.map((t) => (
								<button
									key={t}
									type="button"
									onClick={() => field.handleChange(t)}
									className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
										field.state.value === t
											? "border-primary bg-primary text-primary-foreground"
											: "border-border text-muted-foreground"
									}`}
								>
									{MEAL_TYPE_LABELS[t]}
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
							onChange={(e) => field.handleChange(e.target.value)}
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
							className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
					</div>
				)}
			</form.Field>

			{error && <p className="text-destructive text-sm">{error}</p>}

			<Button type="submit" size="lg" disabled={busy}>
				{busy ? "Guardando…" : "Guardar comida"}
			</Button>
		</form>
	);
}
