import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DisplayControls } from "#/components/display-controls";
import { MealCard } from "#/components/meal-card";
import { getSharedMeals } from "#/lib/share-fn";
import { groupByDay } from "#/routes/_app/history";

export const Route = createFileRoute("/share/$token")({
	loader: ({ params }) => getSharedMeals({ data: { token: params.token } }),
	component: SharePage,
});

function SharePage() {
	const data = Route.useLoaderData();

	if (!data.found) {
		return (
			<main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 py-6">
				<div className="flex justify-end">
					<DisplayControls />
				</div>
				<div className="flex flex-1 flex-col items-center justify-center gap-2 px-2 text-center">
					<h1 className="font-semibold text-2xl">Enlace no válido</h1>
					<p className="text-muted-foreground">
						{"expired" in data && data.expired
							? "Este enlace ha caducado."
							: "Este enlace no existe o ha sido revocado."}
					</p>
				</div>
			</main>
		);
	}

	return (
		<main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-4 py-6">
			<div className="flex justify-end">
				<DisplayControls />
			</div>
			<header>
				<p className="font-semibold text-primary text-sm">Bocado</p>
				<h1 className="font-semibold text-2xl">
					Diario de {data.ownerName || "paciente"}
				</h1>
				<p className="text-muted-foreground text-sm">Vista de solo lectura</p>
			</header>

			{data.meals.length === 0 && (
				<p className="text-muted-foreground">No hay comidas registradas.</p>
			)}

			{groupByDay(data.meals).map(([day, dayMeals]) => (
				<section key={day} className="flex flex-col gap-3">
					<h2 className="font-medium text-muted-foreground text-sm capitalize">
						{format(new Date(day), "EEEE, d 'de' MMMM yyyy", { locale: es })}
					</h2>
					{dayMeals.map((meal) => (
						<MealCard key={meal.id} meal={meal} />
					))}
				</section>
			))}
		</main>
	);
}
