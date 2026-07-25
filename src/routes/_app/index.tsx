import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus } from "lucide-react";
import { MealCard } from "#/components/meal-card";
import { Button } from "#/components/ui/button";
import { useAuth } from "#/lib/auth";
import { useDeleteMeal, useMealsOfDay } from "#/lib/queries";

export const Route = createFileRoute("/_app/")({ component: TodayPage });

function TodayPage() {
	const { user } = useAuth();
	const today = new Date();
	const { data: meals, isLoading } = useMealsOfDay(today);
	const deleteMeal = useDeleteMeal();

	return (
		<div className="flex flex-col gap-6">
			<header className="pt-2">
				<p className="text-muted-foreground text-sm capitalize">
					{format(today, "EEEE, d 'de' MMMM", { locale: es })}
				</p>
				<h1 className="font-semibold text-2xl">
					Hola{user?.name ? `, ${user.name}` : ""} 👋
				</h1>
			</header>

			{isLoading && <p className="text-muted-foreground text-sm">Cargando…</p>}

			{!isLoading && (meals?.length ?? 0) === 0 && (
				<div className="flex flex-col items-center gap-4 rounded-xl border border-border border-dashed py-16 text-center">
					<p className="text-muted-foreground">
						Aún no has registrado nada hoy
					</p>
					<Button asChild>
						<Link to="/nueva">
							<Plus className="size-4" /> Añadir comida
						</Link>
					</Button>
				</div>
			)}

			<div className="flex flex-col gap-4">
				{meals?.map((meal) => (
					<MealCard
						key={meal.id}
						meal={meal}
						onDelete={(id) => deleteMeal.mutate(id)}
					/>
				))}
			</div>
		</div>
	);
}
