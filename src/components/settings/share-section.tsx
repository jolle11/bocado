import { addDays, endOfDay, format } from "date-fns";
import { es } from "date-fns/locale";
import {
	CalendarClock,
	Check,
	Copy,
	Link as LinkIcon,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	useCreateShareLink,
	useDeleteShareLink,
	useShareLinks,
} from "#/lib/queries";

export function ShareSection({ className = "" }: { className?: string }) {
	const { data: links } = useShareLinks();
	const createLink = useCreateShareLink();
	const deleteLink = useDeleteShareLink();
	const [copied, setCopied] = useState<string | null>(null);
	const [duration, setDuration] = useState<
		"day" | "week" | "forever" | "custom"
	>("week");
	const [customDate, setCustomDate] = useState("");
	const [visibility, setVisibility] = useState<"forever" | "custom">("forever");
	const [visibleFrom, setVisibleFrom] = useState("");
	const [visibleUntil, setVisibleUntil] = useState("");

	async function copy(token: string) {
		await navigator.clipboard.writeText(
			`${window.location.origin}/share/${token}`,
		);
		setCopied(token);
		setTimeout(() => setCopied(null), 2000);
	}

	function createShareLink() {
		let expiresAt: Date | null = null;
		if (duration === "day") expiresAt = addDays(new Date(), 1);
		if (duration === "week") expiresAt = addDays(new Date(), 7);
		if (duration === "custom")
			expiresAt = endOfDay(new Date(`${customDate}T00:00:00`));
		createLink.mutate({
			expiresAt,
			visibleFrom:
				visibility === "custom" && visibleFrom
					? new Date(`${visibleFrom}T00:00:00`)
					: null,
			visibleUntil:
				visibility === "custom" && visibleUntil
					? new Date(`${visibleUntil}T00:00:00`)
					: null,
		});
	}

	const minimumCustomDate = format(addDays(new Date(), 1), "yyyy-MM-dd");

	return (
		<section
			id="compartir"
			className={`flex flex-col gap-3 lg:rounded-2xl lg:border lg:bg-card lg:p-5 lg:shadow-sm ${className}`}
		>
			<div>
				<h2 className="font-medium">Compartir con tu nutricionista</h2>
				<p className="text-muted-foreground text-sm">
					Crea un enlace de solo lectura con todo tu diario. Puedes revocarlo
					cuando quieras.
				</p>
			</div>

			{links?.map((link) => (
				<Card key={link.id} className="py-0">
					<CardContent className="flex items-center gap-2 p-3">
						<LinkIcon className="size-4 shrink-0 text-muted-foreground" />
						<div className="min-w-0 flex-1">
							<code className="block truncate text-xs">
								/share/{link.token}
							</code>
							<p className="mt-1 text-muted-foreground text-xs">
								{link.expires_at
									? new Date(link.expires_at) <= new Date()
										? "Caducado"
										: `Caduca ${format(new Date(link.expires_at), "d MMM yyyy, HH:mm", { locale: es })}`
									: "No caduca"}
							</p>
							<p className="text-muted-foreground text-xs">
								{link.visible_from || link.visible_until
									? `Visible: ${link.visible_from ? format(new Date(link.visible_from), "d MMM yyyy", { locale: es }) : "inicio"} – ${link.visible_until ? format(new Date(link.visible_until), "d MMM yyyy", { locale: es }) : "hoy"}`
									: "Todo el diario visible"}
							</p>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => copy(link.token)}
							aria-label="Copiar enlace"
						>
							{copied === link.token ? (
								<Check className="size-4 text-primary" />
							) : (
								<Copy className="size-4" />
							)}
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => deleteLink.mutate(link.id)}
							aria-label="Revocar enlace"
						>
							<Trash2 className="size-4" />
						</Button>
					</CardContent>
				</Card>
			))}

			<div className="flex flex-col gap-2">
				<Label>Duración del nuevo enlace</Label>
				<div className="grid grid-cols-2 gap-2">
					{[
						{ value: "day", label: "1 día" },
						{ value: "week", label: "1 semana" },
						{ value: "forever", label: "Indefinido" },
						{ value: "custom", label: "Fecha concreta" },
					].map((option) => (
						<button
							key={option.value}
							type="button"
							onClick={() =>
								setDuration(
									option.value as "day" | "week" | "forever" | "custom",
								)
							}
							className={`rounded-xl border px-3 py-2 text-sm ${
								duration === option.value
									? "border-primary bg-primary/10 font-medium text-primary"
									: "border-border text-muted-foreground"
							}`}
						>
							{option.label}
						</button>
					))}
				</div>
			</div>

			{duration === "custom" && (
				<div className="flex flex-col gap-2">
					<Label htmlFor="share-expiry">Disponible hasta</Label>
					<Input
						id="share-expiry"
						type="date"
						min={minimumCustomDate}
						value={customDate}
						onChange={(event) => setCustomDate(event.target.value)}
					/>
					<p className="text-muted-foreground text-xs">
						El enlace caducará al terminar ese día.
					</p>
				</div>
			)}

			<div className="flex flex-col gap-2">
				<Label>Periodo visible del diario</Label>
				<div className="grid grid-cols-2 gap-2">
					{[
						{ value: "forever", label: "Indefinido" },
						{ value: "custom", label: "Elegir periodo" },
					].map((option) => (
						<button
							key={option.value}
							type="button"
							onClick={() =>
								setVisibility(option.value as "forever" | "custom")
							}
							className={`rounded-xl border px-3 py-2 text-sm ${
								visibility === option.value
									? "border-primary bg-primary/10 font-medium text-primary"
									: "border-border text-muted-foreground"
							}`}
						>
							{option.label}
						</button>
					))}
				</div>
				<p className="text-muted-foreground text-xs">
					Define qué parte del diario podrá consultar quien abra el enlace.
				</p>
			</div>

			{visibility === "custom" && (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div className="flex min-w-0 flex-col gap-2">
						<Label htmlFor="share-visible-from">Desde</Label>
						<Input
							id="share-visible-from"
							type="date"
							className="max-w-full"
							max={visibleUntil || undefined}
							value={visibleFrom}
							onChange={(event) => setVisibleFrom(event.target.value)}
						/>
					</div>
					<div className="flex min-w-0 flex-col gap-2">
						<Label htmlFor="share-visible-until">Hasta</Label>
						<Input
							id="share-visible-until"
							type="date"
							className="max-w-full"
							min={visibleFrom || undefined}
							value={visibleUntil}
							onChange={(event) => setVisibleUntil(event.target.value)}
						/>
					</div>
				</div>
			)}

			<Button
				variant="outline"
				onClick={createShareLink}
				disabled={
					createLink.isPending ||
					(duration === "custom" && !customDate) ||
					(visibility === "custom" && (!visibleFrom || !visibleUntil))
				}
			>
				<CalendarClock className="size-4" /> Crear enlace para compartir
			</Button>
		</section>
	);
}
