import { Link } from "@tanstack/react-router";

const tabs = [
	{ to: "/history", label: "Lista" },
	{ to: "/week", label: "Semana" },
	{ to: "/calendar", label: "Calendario" },
] as const;

export function DiaryTabs() {
	return (
		<div className="grid grid-cols-3 rounded-xl bg-muted p-1 lg:w-80">
			{tabs.map((tab) => (
				<Link
					key={tab.to}
					to={tab.to}
					className="rounded-lg px-2 py-2 text-center text-muted-foreground text-sm [&.active]:bg-card [&.active]:font-medium [&.active]:text-foreground [&.active]:shadow-sm"
					activeProps={{ className: "active" }}
				>
					{tab.label}
				</Link>
			))}
		</div>
	);
}

export function DiaryHeader() {
	return (
		<div className="flex flex-col gap-5 pt-2 lg:flex-row lg:items-center lg:justify-between">
			<h1 className="font-semibold text-2xl lg:text-3xl">Diario</h1>
			<DiaryTabs />
		</div>
	);
}
