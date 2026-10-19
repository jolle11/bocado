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
	Keyboard,
	PanelLeftClose,
	PanelLeftOpen,
	Plus,
	Settings,
	UtensilsCrossed,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppLoadingShell } from "#/components/app-loading-shell";
import { ComposerSheet } from "#/components/composer-sheet";
import { DisplayControls } from "#/components/display-controls";
import { Kbd, ShortcutsDialog } from "#/components/shortcuts-dialog";
import { Button } from "#/components/ui/button";
import { useAuth } from "#/lib/auth";
import { useComposer, useHotkey, validateComposerSearch } from "#/lib/composer";
import { pb } from "#/lib/pocketbase";
import { usePreferencesSync } from "#/lib/preferences";

export const Route = createFileRoute("/_app")({
	head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
	validateSearch: validateComposerSearch,
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
	const search = Route.useSearch();
	const composer = useComposer();
	usePreferencesSync();
	useHotkey("n", () => composer.openNew(), isLoggedIn);
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
			<DesktopSidebar onAdd={() => composer.openNew()} />
			<ComposerSheet search={search} onClose={composer.close} />
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

const SIDEBAR_COLLAPSED_KEY = "bocado:sidebar-collapsed";

function DesktopSidebar({ onAdd }: { onAdd: () => void }) {
	const [collapsed, setCollapsed] = useState(false);
	const [shortcutsOpen, setShortcutsOpen] = useState(false);

	useEffect(() => {
		setCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1");
	}, []);

	const toggleCollapsed = () => {
		setCollapsed((current) => {
			localStorage.setItem(SIDEBAR_COLLAPSED_KEY, current ? "0" : "1");
			return !current;
		});
	};

	useHotkey("[", toggleCollapsed);
	useHotkey("?", () => setShortcutsOpen(true));

	return (
		<aside
			className={`hidden shrink-0 flex-col gap-6 border-border border-r bg-card/60 py-6 transition-[width] duration-200 lg:flex ${
				collapsed ? "w-[4.5rem] items-center px-3" : "w-64 px-4"
			}`}
		>
			<div
				className={`flex items-center ${collapsed ? "flex-col gap-3" : "justify-between"}`}
			>
				<Link
					to="/app"
					className={`font-semibold text-primary ${collapsed ? "text-xl" : "px-3 text-2xl"}`}
					aria-label="Bocado"
				>
					{collapsed ? "B" : "Bocado"}
				</Link>
				<button
					type="button"
					onClick={toggleCollapsed}
					className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
					aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
					title={`${collapsed ? "Expandir" : "Colapsar"} menú ([)`}
				>
					{collapsed ? (
						<PanelLeftOpen className="size-4" />
					) : (
						<PanelLeftClose className="size-4" />
					)}
				</button>
			</div>
			<Button
				type="button"
				size={collapsed ? "icon" : "lg"}
				className={collapsed ? "size-10" : "w-full justify-start"}
				onClick={onAdd}
				title="Añadir comida (N)"
				aria-label="Añadir comida"
			>
				<Plus className="size-5" />
				{!collapsed && (
					<>
						Añadir comida
						<Kbd className="ml-auto border-primary-foreground/30 text-primary-foreground/80">
							N
						</Kbd>
					</>
				)}
			</Button>
			<nav
				className="flex w-full flex-col gap-1"
				aria-label="Navegación principal"
			>
				<SidebarItem
					to="/app"
					icon={<UtensilsCrossed className="size-4" />}
					label="Hoy"
					collapsed={collapsed}
				/>
				<SidebarItem
					to="/history"
					icon={<CalendarDays className="size-4" />}
					label="Diario"
					matches={["/history", "/week", "/calendar"]}
					collapsed={collapsed}
				/>
				<SidebarItem
					to="/settings"
					icon={<Settings className="size-4" />}
					label="Ajustes"
					collapsed={collapsed}
				/>
			</nav>
			<div
				className={`mt-auto flex gap-3 ${collapsed ? "flex-col items-center" : "items-center justify-between"}`}
			>
				<DisplayControls vertical={collapsed} />
				<button
					type="button"
					onClick={() => setShortcutsOpen(true)}
					className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground text-xs hover:bg-accent hover:text-foreground"
					aria-label="Atajos de teclado"
					title="Atajos de teclado (?)"
				>
					<Keyboard className="size-4" />
					{!collapsed && <Kbd>?</Kbd>}
				</button>
			</div>
			<ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
		</aside>
	);
}

function SidebarItem({
	to,
	icon,
	label,
	matches,
	collapsed,
}: {
	to: string;
	icon: React.ReactNode;
	label: string;
	matches?: string[];
	collapsed: boolean;
}) {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const isActive = (matches ?? [to]).includes(pathname);

	return (
		<Link
			to={to}
			title={collapsed ? label : undefined}
			aria-label={collapsed ? label : undefined}
			className={`flex items-center gap-3 rounded-lg py-2 font-medium text-sm transition-colors ${
				collapsed ? "justify-center px-0" : "px-3"
			} ${
				isActive
					? "bg-primary/10 text-primary"
					: "text-muted-foreground hover:bg-accent hover:text-foreground"
			}`}
		>
			{icon}
			{!collapsed && label}
		</Link>
	);
}
