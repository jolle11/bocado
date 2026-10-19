import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EditMealEditor } from "#/components/meal-editors";

export const Route = createFileRoute("/_app/edit/$mealId")({
	component: EditMealPage,
});

function EditMealPage() {
	const { mealId } = Route.useParams();
	const navigate = useNavigate();

	return (
		<div className="flex flex-col gap-6 lg:max-w-2xl">
			<header className="pt-2">
				<h1 className="font-semibold text-2xl">Editar entrada</h1>
			</header>
			<EditMealEditor mealId={mealId} onDone={() => navigate({ to: "/app" })} />
		</div>
	);
}
