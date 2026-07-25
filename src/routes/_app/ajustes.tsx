import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
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

export const Route = createFileRoute("/_app/ajustes")({
	component: SettingsPage,
});

function SettingsPage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const { data: links } = useShareLinks();
	const createLink = useCreateShareLink();
	const deleteLink = useDeleteShareLink();
	const [copied, setCopied] = useState<string | null>(null);
	const { palette, mode, setPalette, setMode } = useTheme();
	const { showImages, setShowImages } = useImagePreference();

	async function copy(token: string) {
		await navigator.clipboard.writeText(
			`${window.location.origin}/share/${token}`,
		);
		setCopied(token);
		setTimeout(() => setCopied(null), 2000);
	}

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
				<div className="grid grid-cols-4 gap-2">
					{THEME_PALETTES.map((option) => (
						<button
							key={option.id}
							type="button"
							onClick={() => setPalette(option.id)}
							className={`flex flex-col items-center gap-2 rounded-xl border p-2 text-xs ${
								palette === option.id
									? "border-primary bg-primary/10 text-primary"
									: "border-border text-muted-foreground"
							}`}
						>
							<span
								className="size-7 rounded-full border border-black/10 shadow-sm"
								style={{ backgroundColor: option.swatch }}
							/>
							{option.label}
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
							<code className="min-w-0 flex-1 truncate text-xs">
								/share/{link.token}
							</code>
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

				<Button
					variant="outline"
					onClick={() => createLink.mutate()}
					disabled={createLink.isPending}
				>
					<LinkIcon className="size-4" /> Crear enlace para compartir
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
