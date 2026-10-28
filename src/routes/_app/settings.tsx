import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { AppearanceSection } from "#/components/settings/appearance-section";
import { PhotosSection } from "#/components/settings/photos-section";
import { RemindersSection } from "#/components/settings/reminders-section";
import { ShareSection } from "#/components/settings/share-section";
import { TemplatesSection } from "#/components/settings/templates-section";
import { WaterGoalSection } from "#/components/settings/water-goal-section";
import { Button } from "#/components/ui/button";
import { logout, useAuth } from "#/lib/auth";

export const Route = createFileRoute("/_app/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	const { user } = useAuth();
	const navigate = useNavigate();

	const handleLogout = async () => {
		await logout();
		navigate({ to: "/login" });
	};

	return (
		<div className="flex flex-col gap-6 lg:mx-auto lg:w-full lg:max-w-5xl">
			<header className="flex items-end justify-between gap-4 pt-2">
				<div>
					<h1 className="font-semibold text-2xl lg:text-3xl">Ajustes</h1>
					<p className="text-muted-foreground text-sm">{user?.email}</p>
				</div>
				<Button
					variant="outline"
					className="hidden text-destructive hover:text-destructive lg:inline-flex"
					onClick={handleLogout}
				>
					<LogOut className="size-4" /> Cerrar sesión
				</Button>
			</header>

			<div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-5">
				<div className="flex flex-col gap-6 lg:gap-5">
					<AppearanceSection />
					<PhotosSection />
					<WaterGoalSection />
					<RemindersSection />
				</div>
				<div className="flex flex-col gap-6 lg:gap-5">
					<ShareSection />
					<TemplatesSection />
				</div>

				<section id="cuenta" className="mt-4 lg:hidden">
					<Button
						variant="destructive"
						className="w-full"
						onClick={handleLogout}
					>
						<LogOut className="size-4" /> Cerrar sesión
					</Button>
				</section>
			</div>
		</div>
	);
}
