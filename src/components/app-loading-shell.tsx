export function AppLoadingShell() {
	return (
		<output
			aria-label="Cargando aplicación"
			aria-busy="true"
			className="mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden"
		>
			<main className="min-h-0 flex-1 overflow-hidden px-4 pt-4 pb-4">
				<div className="animate-pulse">
					<div className="mb-6 flex justify-end">
						<div className="h-9 w-24 rounded-md bg-muted" />
					</div>
					<div className="mb-8 space-y-2">
						<div className="h-4 w-36 rounded bg-muted" />
						<div className="h-8 w-52 rounded bg-muted" />
					</div>
					<div className="space-y-4">
						<div className="h-44 rounded-xl bg-muted" />
						<div className="h-28 rounded-xl bg-muted" />
					</div>
				</div>
			</main>
			<div className="shrink-0 border-border border-t bg-card">
				<div className="mx-auto grid max-w-lg grid-cols-4 items-center px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
					{["today", "new", "history", "settings"].map((item) => (
						<div
							key={item}
							className={
								item === "new"
									? "mx-auto size-14 rounded-full bg-muted"
									: "mx-auto h-9 w-12 rounded-md bg-muted"
							}
						/>
					))}
				</div>
			</div>
			<span className="sr-only">Cargando…</span>
		</output>
	);
}
