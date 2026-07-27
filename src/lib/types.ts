import { z } from "zod";

export const MEAL_TYPES = [
	"desayuno",
	"almuerzo",
	"comida",
	"merienda",
	"cena",
	"snack",
] as const;

export type MealType = (typeof MEAL_TYPES)[number];

export const ENTRY_TYPES = ["meal", "water", "extra"] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
	meal: "Comida",
	water: "Agua",
	extra: "Extra",
};

export function normalizeEntryType(value: unknown): EntryType {
	return value === "water" || value === "extra" ? value : "meal";
}

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
	desayuno: "Desayuno",
	almuerzo: "Almuerzo",
	comida: "Comida",
	merienda: "Merienda",
	cena: "Cena",
	snack: "Snack",
};

export const mealFormSchema = z
	.object({
		entry_type: z.enum(ENTRY_TYPES),
		description: z.string().max(2000, "Máximo 2000 caracteres"),
		meal_type: z.enum(MEAL_TYPES),
		water_ml: z.number().int().min(0).max(10000),
		finished: z.boolean(),
		unfinished_note: z.string().max(500, "Máximo 500 caracteres"),
		eaten_at: z.string().min(1, "Falta la hora"),
		photo_url: z.string(),
		photo_key: z.string(),
		photos: z
			.array(z.object({ url: z.string().url(), key: z.string() }))
			.max(5, "Máximo 5 fotos"),
	})
	.superRefine((value, context) => {
		if (value.entry_type !== "water" && !value.description.trim()) {
			context.addIssue({
				code: "custom",
				path: ["description"],
				message:
					value.entry_type === "meal"
						? "Cuenta qué has comido"
						: "Escribe qué quieres anotar",
			});
		}
		if (value.entry_type === "water" && value.water_ml < 1) {
			context.addIssue({
				code: "custom",
				path: ["water_ml"],
				message: "Indica una cantidad de agua",
			});
		}
	});

export type MealForm = z.infer<typeof mealFormSchema>;

export interface MealPhoto {
	url: string;
	key: string;
}

export interface Meal {
	id: string;
	user: string;
	description: string;
	photo_url: string;
	photo_key: string;
	photos?: MealPhoto[];
	entry_type?: EntryType | "";
	meal_type: MealType;
	water_ml?: number;
	unfinished?: boolean;
	unfinished_note?: string;
	eaten_at: string;
	created: string;
	updated: string;
}

export interface ShareLink {
	id: string;
	user: string;
	token: string;
	active: boolean;
	expires_at?: string;
	visible_from?: string;
	visible_until?: string;
	created: string;
}
