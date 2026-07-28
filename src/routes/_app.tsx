import {
	createFileRoute,
	Link,
	Outlet,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { CalendarDays, Plus, Settings, UtensilsCrossed } from "lucide-react";
import { useEffect } from "react";
import { DisplayControls } from "#/components/display-controls";
import { useAuth } from "#/lib/auth";
import { pb } from "#/lib/pocketbase";
import { usePreferencesSync } from "#/lib/preferences";

export const Route = createFileRoute("/_app")({
	beforeLoad: () => {
		if (typeof window !== "undefined" && !pb.authStore.isValid) {
			throw redirect({ to: "/login" });
		}
	},
	component: AppLayout,
});

function AppLayout() {
	const { isLoggedIn, isReady } = useAuth();
	const navigate = useNavigate();
	usePreferencesSync();

	useEffect(() => {
		if (isReady && !isLoggedIn) {
			navigate({ to: "/login" });
		}
	}, [isLoggedIn, isReady, navigate]);

	if (!isReady || !isLoggedIn) return null;

	return (
		<div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col">
			<main className="flex-1 px-4 pt-4 pb-28">
				<div className="mb-2 flex justify-end">
					<DisplayControls />
				</div>
				<Outlet />
			</main>
			<nav className="fixed inset-x-0 bottom-0 z-30 border-border border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
				<div className="mx-auto grid max-w-lg grid-cols-4 items-center px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
					<NavItem
						to="/"
						icon={<UtensilsCrossed className="size-5" />}
						label="Hoy"
					/>
					<Link
						to="/new"
						className="justify-self-center"
						aria-label="Añadir comida"
					>
						<span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
							<Plus className="size-7" />
						</span>
					</Link>
					<NavItem
						to="/history"
						icon={<CalendarDays className="size-5" />}
						label="Diario"
					/>
					<NavItem
						to="/settings"
						icon={<Settings className="size-5" />}
						label="Ajustes"
					/>
				</div>
			</nav>
		</div>
	);
}

function NavItem({
	to,
	icon,
	label,
}: {
	to: string;
	icon: React.ReactNode;
	label: string;
}) {
	return (
		<Link
			to={to}
			className="flex flex-col items-center gap-1 rounded-md py-1 text-muted-foreground text-xs [&.active]:text-primary"
			activeProps={{ className: "active" }}
		>
			{icon}
			{label}
		</Link>
	);
}
