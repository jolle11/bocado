/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const users = app.findCollectionByNameOrId("users");
		const templates = new Collection({
			type: "base",
			name: "meal_templates",
			listRule: "user = @request.auth.id",
			viewRule: "user = @request.auth.id",
			createRule:
				'@request.auth.id != "" && @request.body.user = @request.auth.id',
			updateRule:
				"user = @request.auth.id && (@request.body.user:isset = false || @request.body.user = @request.auth.id)",
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
				{ name: "name", type: "text", required: true, max: 80 },
				{
					name: "entry_type",
					type: "select",
					maxSelect: 1,
					values: ["meal", "water", "extra"],
				},
				{
					name: "meal_type",
					type: "select",
					maxSelect: 1,
					values: ["desayuno", "almuerzo", "comida", "merienda", "cena", "snack"],
				},
				{ name: "description", type: "text", max: 2000 },
				{ name: "water_ml", type: "number", min: 0, max: 10000 },
				{ name: "created", type: "autodate", onCreate: true },
				{ name: "updated", type: "autodate", onCreate: true, onUpdate: true },
			],
			indexes: ["CREATE INDEX idx_meal_templates_user ON meal_templates (user)"],
		});
		app.save(templates);
	},
	(app) => {
		app.delete(app.findCollectionByNameOrId("meal_templates"));
	},
);
