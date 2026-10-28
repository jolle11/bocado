import { Droplets, Minus, Plus, Sparkles, UtensilsCrossed } from "lucide-react";
import type { ReactNode } from "react";
import { Label } from "#/components/ui/label";
import {
	ENTRY_TYPE_LABELS,
	ENTRY_TYPES,
	type EntryType,
	MEAL_TYPE_LABELS,
	MEAL_TYPES,
	type MealType,
} from "#/lib/types";

export const ENTRY_TYPE_ICONS = {
	meal: UtensilsCrossed,
	water: Droplets,
	extra: Sparkles,
} satisfies Record<EntryType, unknown>;

export function FieldError({ message }: { message?: string }) {
	if (!message) return null;
	return <p className="text-destructive text-sm">{message}</p>;
}

export function EntryTypePicker({
	value,
	onChange,
}: {
	value: EntryType;
	onChange: (type: EntryType) => void;
}) {
	return (
		<div className="grid gap-2">
			<Label>¿Qué quieres añadir?</Label>
			<div className="grid grid-cols-3 rounded-xl bg-muted p-1">
				{ENTRY_TYPES.map((type) => {
					const Icon = ENTRY_TYPE_ICONS[type];
					return (
						<button
							key={type}
							type="button"
							aria-pressed={value === type}
							onClick={() => onChange(type)}
							className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-sm ${
								value === type
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
	);
}

export function MealTypePicker({
	value,
	onChange,
}: {
	value: MealType;
	onChange: (type: MealType) => void;
}) {
	return (
		<div className="grid gap-2">
			<Label>Tipo</Label>
			<div className="flex flex-wrap gap-2">
				{MEAL_TYPES.map((type) => (
					<button
						key={type}
						type="button"
						aria-pressed={value === type}
						onClick={() => onChange(type)}
						className={`rounded-full border px-4 py-1.5 text-sm ${
							value === type
								? "border-primary bg-primary text-primary-foreground"
								: "border-border text-muted-foreground"
						}`}
					>
						{MEAL_TYPE_LABELS[type]}
					</button>
				))}
			</div>
		</div>
	);
}

export function formatWater(ml: number) {
	if (ml >= 1000) {
		const liters = ml / 1000;
		return `${Number.isInteger(liters) ? liters : liters.toFixed(2)} l`;
	}
	return `${ml} ml`;
}

export function WaterAmountField({
	value,
	onChange,
	error,
}: {
	value: number;
	onChange: (ml: number) => void;
	error?: string;
}) {
	return (
		<div className="grid gap-2">
			<Label>¿Cuánta agua?</Label>
			<div className="rounded-2xl border bg-card p-5">
				<div className="flex items-center justify-center gap-6">
					<AmountButton
						label="Restar 250 ml"
						onClick={() => onChange(Math.max(250, value - 250))}
					>
						<Minus className="size-5" />
					</AmountButton>
					<div className="min-w-28 text-center">
						<Droplets className="mx-auto size-9 text-sky-500" />
						<p className="mt-1 font-semibold text-3xl">{formatWater(value)}</p>
						<p className="text-muted-foreground text-sm">de agua</p>
					</div>
					<AmountButton
						label="Sumar 250 ml"
						onClick={() => onChange(Math.min(10000, value + 250))}
					>
						<Plus className="size-5" />
					</AmountButton>
				</div>
			</div>
			<FieldError message={error} />
		</div>
	);
}

function AmountButton({
	label,
	children,
	onClick,
}: {
	label: string;
	children: ReactNode;
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

export function Switch({
	id,
	checked,
	onChange,
	onLabel,
	offLabel,
}: {
	id: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	onLabel: string;
	offLabel: string;
}) {
	return (
		<button
			id={id}
			type="button"
			role="switch"
			aria-checked={checked}
			onClick={() => onChange(!checked)}
			className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
				checked ? "bg-primary" : "bg-muted-foreground/35"
			}`}
		>
			<span
				aria-hidden="true"
				className={`absolute top-1 left-1 size-5 rounded-full bg-white shadow-sm transition-transform ${
					checked ? "translate-x-5" : "translate-x-0"
				}`}
			/>
			<span className="sr-only">{checked ? onLabel : offLabel}</span>
		</button>
	);
}
