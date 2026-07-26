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

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
	desayuno: "Desayuno",
	almuerzo: "Almuerzo",
	comida: "Comida",
	merienda: "Merienda",
	cena: "Cena",
	snack: "Snack",
};

export const mealFormSchema = z.object({
	description: z
		.string()
		.min(1, "Cuenta qué has comido")
		.max(2000, "Máximo 2000 caracteres"),
	meal_type: z.enum(MEAL_TYPES),
	eaten_at: z.string().min(1, "Falta la hora"),
	photo_url: z.string(),
	photo_key: z.string(),
	photos: z
		.array(z.object({ url: z.string().url(), key: z.string() }))
		.max(5, "Máximo 5 fotos"),
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
	meal_type: MealType;
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
	created: string;
}
