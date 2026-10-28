import { addDays, startOfDay } from "date-fns";
import { useEffect, useState } from "react";

/**
 * Fecha de "hoy" que se actualiza al pasar la medianoche y al volver a la app
 * (una PWA puede quedarse abierta en segundo plano varios días).
 */
export function useToday() {
	const [today, setToday] = useState(() => startOfDay(new Date()));

	// biome-ignore lint/correctness/useExhaustiveDependencies: `today` reprograma el temporizador de medianoche.
	useEffect(() => {
		const refresh = () => {
			const now = startOfDay(new Date());
			setToday((current) =>
				current.getTime() === now.getTime() ? current : now,
			);
		};
		const msToMidnight =
			addDays(startOfDay(new Date()), 1).getTime() - Date.now() + 1000;
		const timer = window.setTimeout(refresh, msToMidnight);
		document.addEventListener("visibilitychange", refresh);
		window.addEventListener("focus", refresh);
		return () => {
			window.clearTimeout(timer);
			document.removeEventListener("visibilitychange", refresh);
			window.removeEventListener("focus", refresh);
		};
	}, [today]);

	return today;
}
