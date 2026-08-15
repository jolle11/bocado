/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const users = app.findCollectionByNameOrId("users");

		const subscriptions = new Collection({
			type: "base",
			name: "push_subscriptions",
			listRule: "user = @request.auth.id",
			viewRule: "user = @request.auth.id",
			createRule:
				'@request.auth.id != "" && @request.body.user = @request.auth.id',
			updateRule: "user = @request.auth.id",
			deleteRule: "user = @request.auth.id",
			fields: [
				{
					name: "user",
					type: "relation",
					required: true,
					collectionId: users.id,
					cascadeDelete: true,
					maxSelect: 1,
				},
				{ name: "endpoint", type: "text", required: true, max: 4000 },
				{ name: "p256dh", type: "text", required: true, max: 1000 },
				{ name: "auth", type: "text", required: true, max: 1000 },
				{ name: "created", type: "autodate", onCreate: true },
				{ name: "updated", type: "autodate", onCreate: true, onUpdate: true },
			],
			indexes: [
				"CREATE UNIQUE INDEX idx_push_subscriptions_endpoint ON push_subscriptions (endpoint)",
				"CREATE INDEX idx_push_subscriptions_user ON push_subscriptions (user)",
			],
		});
		app.save(subscriptions);

		const deliveries = new Collection({
			type: "base",
			name: "reminder_deliveries",
			listRule: null,
			viewRule: null,
			createRule: null,
			updateRule: null,
			deleteRule: null,
			fields: [
				{
					name: "user",
					type: "relation",
					required: true,
					collectionId: users.id,
					cascadeDelete: true,
					maxSelect: 1,
				},
				{
					name: "meal_type",
					type: "select",
					required: true,
					maxSelect: 1,
					values: ["desayuno", "comida", "cena"],
				},
				{ name: "local_day", type: "text", required: true, max: 10 },
				{ name: "created", type: "autodate", onCreate: true },
			],
			indexes: [
				"CREATE UNIQUE INDEX idx_reminder_delivery_once ON reminder_deliveries (user, meal_type, local_day)",
			],
		});
		app.save(deliveries);
	},
	(app) => {
		app.delete(app.findCollectionByNameOrId("reminder_deliveries"));
		app.delete(app.findCollectionByNameOrId("push_subscriptions"));
	},
);
