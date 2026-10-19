import {
	createFileRoute,
	Link,
	Outlet,
	redirect,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import {
	ArrowUp,
	CalendarDays,
	Plus,
	Settings,
	UtensilsCrossed,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppLoadingShell } from "#/components/app-loading-shell";
import { DisplayControls } from "#/components/display-controls";
import { Button } from "#/components/ui/button";
import { useAuth } from "#/lib/auth";
import { pb } from "#/lib/pocketbase";
import { usePreferencesSync } from "#/lib/preferences";

export const Route = createFileRoute("/_app")({
	head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
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
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const mainRef = useRef<HTMLElement>(null);
	const [showScrollToTop, setShowScrollToTop] = useState(false);
	usePreferencesSync();
	const isHistoryPage = pathname === "/history";

	const scrollToTop = () => {
		mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
	};

	useEffect(() => {
		if (isReady && !isLoggedIn) {
			navigate({ to: "/login" });
		}
	}, [isLoggedIn, isReady, navigate]);

	useEffect(() => {
		setShowScrollToTop(
			pathname === "/history" && (mainRef.current?.scrollTop ?? 0) >= 600,
		);
	}, [pathname]);

	if (!isReady) return <AppLoadingShell />;
	if (!isLoggedIn) return null;

	return (
		<div className="relative mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden lg:max-w-none lg:flex-row">
			<DesktopSidebar />
			<main
				ref={mainRef}
				className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pt-4 pb-4 lg:px-10 lg:pt-8 lg:pb-10"
				onScroll={(event) => {
					if (isHistoryPage) {
						setShowScrollToTop(event.currentTarget.scrollTop >= 600);
					}
				}}
			>
				<div className="mx-auto w-full lg:max-w-6xl">
					<div className="mb-2 flex justify-end lg:hidden">
						<DisplayControls />
					</div>
					<Outlet />
				</div>
			</main>
			{isHistoryPage && showScrollToTop && (
				<Button
					type="button"
					size="icon"
					className="absolute right-4 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-20 rounded-full shadow-lg sm:hidden"
					onClick={scrollToTop}
					aria-label="Volver arriba"
				>
					<ArrowUp className="size-5" />
				</Button>
			)}
			<nav className="z-30 shrink-0 border-border lg:hidden border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
				<div className="mx-auto grid max-w-lg grid-cols-4 items-center px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
					<NavItem
						to="/app"
						icon={<UtensilsCrossed className="size-5" />}
						label="Hoy"
					/>
					<Link
						to="/new"
						search={{ mealType: undefined }}
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
						onClick={(event) => {
							if (isHistoryPage) {
								event.preventDefault();
								scrollToTop();
							}
						}}
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
	onClick,
}: {
	to: string;
	icon: React.ReactNode;
	label: string;
	onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}) {
	return (
		<Link
			to={to}
			className="flex flex-col items-center gap-1 rounded-md py-1 text-muted-foreground text-xs [&.active]:text-primary"
			activeProps={{ className: "active" }}
			onClick={onClick}
		>
			{icon}
			{label}
		</Link>
	);
}

function DesktopSidebar() {
	return (
		<aside className="hidden w-64 shrink-0 flex-col gap-6 border-border border-r bg-card/60 px-4 py-6 lg:flex">
			<Link to="/app" className="px-3 font-semibold text-2xl text-primary">
				Bocado
			</Link>
			<Button asChild size="lg" className="w-full justify-start">
				<Link to="/new" search={{ mealType: undefined }}>
					<Plus className="size-5" /> Añadir comida
				</Link>
			</Button>
			<nav className="flex flex-col gap-1" aria-label="Navegación principal">
				<SidebarItem
					to="/app"
					icon={<UtensilsCrossed className="size-4" />}
					label="Hoy"
				/>
				<SidebarItem
					to="/history"
					icon={<CalendarDays className="size-4" />}
					label="Diario"
					matches={["/history", "/week", "/calendar"]}
				/>
				<SidebarItem
					to="/settings"
					icon={<Settings className="size-4" />}
					label="Ajustes"
				/>
			</nav>
			<div className="mt-auto">
				<DisplayControls />
			</div>
		</aside>
	);
}

function SidebarItem({
	to,
	icon,
	label,
	matches,
}: {
	to: string;
	icon: React.ReactNode;
	label: string;
	matches?: string[];
}) {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const isActive = (matches ?? [to]).includes(pathname);

	return (
		<Link
			to={to}
			className={`flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-sm transition-colors ${
				isActive
					? "bg-primary/10 text-primary"
					: "text-muted-foreground hover:bg-accent hover:text-foreground"
			}`}
		>
			{icon}
			{label}
		</Link>
	);
}
