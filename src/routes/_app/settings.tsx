import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { addDays, endOfDay, format } from "date-fns";
import { es } from "date-fns/locale";
import {
	CalendarClock,
	Check,
	Copy,
	Eye,
	EyeOff,
	Link as LinkIcon,
	LogOut,
	Monitor,
	Moon,
	Palette,
	Sun,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { logout, useAuth } from "#/lib/auth";
import {
	THEME_PALETTES,
	useImagePreference,
	useTheme,
} from "#/lib/preferences";
import {
	useCreateShareLink,
	useDeleteShareLink,
	useShareLinks,
} from "#/lib/queries";

export const Route = createFileRoute("/_app/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	const { user } = useAuth();
	const navigate = useNavigate();
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
	const { palette, mode, setPalette, setMode } = useTheme();
	const { showImages, setShowImages } = useImagePreference();

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
		<div className="flex flex-col gap-6">
			<header className="pt-2">
				<h1 className="font-semibold text-2xl">Ajustes</h1>
				<p className="text-muted-foreground text-sm">{user?.email}</p>
			</header>

			<section className="flex flex-col gap-3">
				<div className="flex items-center gap-2">
					<Palette className="size-4 text-muted-foreground" />
					<h2 className="font-medium">Apariencia</h2>
				</div>
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
					{THEME_PALETTES.map((option) => (
						<button
							key={option.id}
							type="button"
							onClick={() => setPalette(option.id)}
							className={`flex min-w-0 flex-col items-center gap-2 rounded-xl border p-2 text-xs ${
								palette === option.id
									? "border-primary bg-primary/10 text-primary"
									: "border-border text-muted-foreground"
							}`}
						>
							<span
								className="size-7 rounded-full border border-black/10 shadow-sm"
								style={{ backgroundColor: option.swatch }}
							/>
							<span className="w-full min-w-0 whitespace-nowrap text-center leading-tight">
								{option.label}
							</span>
						</button>
					))}
				</div>
				<div className="grid grid-cols-3 rounded-xl bg-muted p-1">
					<button
						type="button"
						onClick={() => setMode("system")}
						className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm ${
							mode === "system"
								? "bg-card font-medium text-foreground shadow-sm"
								: "text-muted-foreground"
						}`}
					>
						<Monitor className="size-4" /> Automático
					</button>
					<button
						type="button"
						onClick={() => setMode("light")}
						className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm ${
							mode === "light"
								? "bg-card font-medium text-foreground shadow-sm"
								: "text-muted-foreground"
						}`}
					>
						<Sun className="size-4" /> Claro
					</button>
					<button
						type="button"
						onClick={() => setMode("dark")}
						className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm ${
							mode === "dark"
								? "bg-card font-medium text-foreground shadow-sm"
								: "text-muted-foreground"
						}`}
					>
						<Moon className="size-4" /> Oscuro
					</button>
				</div>
			</section>

			<section className="flex flex-col gap-3">
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

			<section className="flex flex-col gap-3">
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
						<div className="flex flex-col gap-2">
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
						<div className="flex flex-col gap-2">
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

			<section className="mt-4">
				<Button
					variant="destructive"
					className="w-full"
					onClick={() => {
						logout();
						navigate({ to: "/login" });
					}}
				>
					<LogOut className="size-4" /> Cerrar sesión
				</Button>
			</section>
		</div>
	);
}
