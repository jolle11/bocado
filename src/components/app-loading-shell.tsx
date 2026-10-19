export function AppLoadingShell() {
	return (
		<output
			aria-label="Cargando aplicación"
			aria-busy="true"
			className="mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden lg:max-w-none lg:flex-row"
		>
			<div className="hidden w-64 shrink-0 animate-pulse flex-col gap-6 border-border border-r bg-card/60 px-4 py-6 lg:flex">
				<div className="h-8 w-28 rounded bg-muted" />
				<div className="h-10 rounded-md bg-muted" />
				<div className="space-y-2">
					<div className="h-9 rounded-lg bg-muted" />
					<div className="h-9 rounded-lg bg-muted" />
					<div className="h-9 rounded-lg bg-muted" />
				</div>
			</div>
			<main className="min-h-0 flex-1 overflow-hidden px-4 pt-4 pb-4 lg:px-10 lg:pt-8">
				<div className="mx-auto animate-pulse lg:max-w-6xl">
					<div className="mb-6 flex justify-end lg:hidden">
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
			<div className="shrink-0 border-border border-t bg-card lg:hidden">
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
