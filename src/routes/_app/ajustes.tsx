import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Copy, Link as LinkIcon, LogOut, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { logout, useAuth } from "#/lib/auth";
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
