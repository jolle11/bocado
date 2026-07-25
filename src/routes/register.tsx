import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { register } from "#/lib/auth";

export const Route = createFileRoute("/register")({ component: RegisterPage });

function RegisterPage() {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		const password = String(data.get("password"));
		if (password.length < 8) {
			setError("La contraseña debe tener al menos 8 caracteres");
			return;
		}
		setLoading(true);
		setError(null);
		try {
			await register(
				String(data.get("email")),
				password,
				String(data.get("name")),
			);
			navigate({ to: "/" });
		} catch {
			setError("No se pudo crear la cuenta. ¿Quizá el email ya está en uso?");
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="flex min-h-dvh flex-col justify-center gap-8 px-6 pb-16">
			<div className="text-center">
				<p className="font-semibold text-5xl text-primary">Bocado</p>
				<p className="mt-2 text-muted-foreground">Crea tu cuenta</p>
			</div>
			<form
				onSubmit={onSubmit}
				className="mx-auto flex w-full max-w-sm flex-col gap-4"
			>
				<div className="grid gap-2">
					<Label htmlFor="name">Nombre</Label>
					<Input id="name" name="name" required autoComplete="name" />
				</div>
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
						autoComplete="new-password"
					/>
				</div>
				{error && <p className="text-destructive text-sm">{error}</p>}
				<Button type="submit" size="lg" disabled={loading}>
					{loading ? "Creando cuenta…" : "Crear cuenta"}
				</Button>
				<p className="text-center text-muted-foreground text-sm">
					¿Ya tienes cuenta?{" "}
					<Link to="/login" className="text-primary underline">
						Entra
					</Link>
				</p>
			</form>
		</main>
	);
}
