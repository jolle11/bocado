import { Link } from "@tanstack/react-router";

const tabs = [
	{ to: "/historial", label: "Lista" },
	{ to: "/semana", label: "Semana" },
	{ to: "/calendario", label: "Calendario" },
] as const;

export function DiaryTabs() {
	return (
		<div className="grid grid-cols-3 rounded-xl bg-muted p-1">
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
