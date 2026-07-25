import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { DisplayControls } from "#/components/display-controls";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { login } from "#/lib/auth";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		setLoading(true);
		setError(null);
		try {
			await login(String(data.get("email")), String(data.get("password")));
			navigate({ to: "/" });
		} catch {
			setError("Email o contraseña incorrectos");
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="flex min-h-dvh flex-col justify-center gap-8 px-6 pb-16">
			<div className="absolute top-[calc(env(safe-area-inset-top)+1rem)] right-4">
				<DisplayControls showImageToggle={false} />
			</div>
			<div className="text-center">
				<p className="font-semibold text-5xl text-primary">Bocado</p>
				<p className="mt-2 text-muted-foreground">
					Tu diario de comidas, listo para tu nutricionista
				</p>
			</div>
			<form
				onSubmit={onSubmit}
				className="mx-auto flex w-full max-w-sm flex-col gap-4"
			>
				<div className="grid gap-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						name="email"
						type="email"
						required
						autoComplete="email"
					/>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="password">Contraseña</Label>
					<Input
						id="password"
						name="password"
						type="password"
						required
						autoComplete="current-password"
					/>
				</div>
				{error && <p className="text-destructive text-sm">{error}</p>}
				<Button type="submit" size="lg" disabled={loading}>
					{loading ? "Entrando…" : "Entrar"}
				</Button>
				<p className="text-center text-muted-foreground text-sm">
					¿No tienes cuenta?{" "}
					<Link to="/register" className="text-primary underline">
						Regístrate
					</Link>
				</p>
			</form>
		</main>
	);
}
