import { Bell, BellOff } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { useReminderPreferences } from "#/lib/preferences";
import {
	disablePushNotifications,
	enablePushNotifications,
	supportsPushNotifications,
} from "#/lib/push-notifications";

export function RemindersSection({ className = "" }: { className?: string }) {
	const { reminders, setReminders } = useReminderPreferences();
	const [pushPending, setPushPending] = useState(false);
	const [pushError, setPushError] = useState("");

	async function toggleReminders() {
		setPushPending(true);
		setPushError("");
		try {
			if (reminders.enabled) {
				await disablePushNotifications();
				setReminders({ ...reminders, enabled: false });
			} else {
				await enablePushNotifications();
				setReminders({
					...reminders,
					enabled: true,
					timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
				});
			}
		} catch (error) {
			setPushError(
				error instanceof Error
					? error.message
					: "No se pudo cambiar la configuración",
			);
		} finally {
			setPushPending(false);
		}
	}

	return (
		<section
			id="recordatorios"
			className={`flex flex-col gap-3 lg:rounded-2xl lg:border lg:bg-card lg:p-5 lg:shadow-sm ${className}`}
		>
			<div className="flex items-center gap-2">
				<Bell className="size-4 text-muted-foreground" />
				<div>
					<h2 className="font-medium">Recordatorios de comidas</h2>
					<p className="text-muted-foreground text-sm">
						Recibe un aviso si aún no has registrado esa comida.
					</p>
				</div>
			</div>
			<Button
				variant="outline"
				className="justify-start"
				onClick={toggleReminders}
				disabled={
					pushPending || (!reminders.enabled && !supportsPushNotifications())
				}
			>
				{reminders.enabled ? (
					<BellOff className="size-4" />
				) : (
					<Bell className="size-4" />
				)}
				{reminders.enabled
					? "Desactivar recordatorios"
					: "Activar recordatorios"}
			</Button>
			{!supportsPushNotifications() && (
				<p className="text-muted-foreground text-xs">
					Este navegador no admite Web Push. En iPhone, instala primero Bocado
					en la pantalla de inicio.
				</p>
			)}
			{pushError && <p className="text-destructive text-xs">{pushError}</p>}
			{reminders.enabled && (
				<div className="flex flex-col gap-3 rounded-xl border p-3">
					{(["desayuno", "comida", "cena"] as const).map((meal) => {
						const labels = {
							desayuno: "Desayuno",
							comida: "Comida",
							cena: "Cena",
						};
						const preference = reminders.meals[meal];
						return (
							<div key={meal} className="flex items-center gap-3">
								<button
									type="button"
									className={`flex-1 rounded-lg border px-3 py-2 text-left text-sm ${preference.enabled ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"}`}
									onClick={() =>
										setReminders({
											...reminders,
											meals: {
												...reminders.meals,
												[meal]: {
													...preference,
													enabled: !preference.enabled,
												},
											},
										})
									}
								>
									{labels[meal]}
								</button>
								<Input
									type="time"
									aria-label={`Hora del recordatorio de ${labels[meal].toLowerCase()}`}
									className="w-32"
									value={preference.time}
									disabled={!preference.enabled}
									onChange={(event) =>
										setReminders({
											...reminders,
											meals: {
												...reminders.meals,
												[meal]: {
													...preference,
													time: event.target.value,
												},
											},
										})
									}
								/>
							</div>
						);
					})}
					<p className="text-muted-foreground text-xs">
						Zona horaria: {reminders.timeZone}
					</p>
				</div>
			)}
		</section>
	);
}
