/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const users = app.findCollectionByNameOrId("users");

		const meals = new Collection({
			type: "base",
			name: "meals",
			listRule: "user = @request.auth.id",
			viewRule: "user = @request.auth.id",
			createRule: '@request.auth.id != "" && @request.body.user = @request.auth.id',
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
				{ name: "description", type: "text", required: true, max: 2000 },
				{ name: "photo_url", type: "url" },
				{ name: "photo_key", type: "text" },
				{
					name: "meal_type",
					type: "select",
					maxSelect: 1,
					values: ["desayuno", "almuerzo", "comida", "merienda", "cena", "snack"],
				},
				{ name: "eaten_at", type: "date", required: true },
				{ name: "created", type: "autodate", onCreate: true },
				{ name: "updated", type: "autodate", onCreate: true, onUpdate: true },
			],
			indexes: ["CREATE INDEX idx_meals_user_eaten ON meals (user, eaten_at)"],
		});
		app.save(meals);

		const shareLinks = new Collection({
			type: "base",
			name: "share_links",
			listRule: "user = @request.auth.id",
			viewRule: "user = @request.auth.id",
			createRule: '@request.auth.id != "" && @request.body.user = @request.auth.id',
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
				{ name: "token", type: "text", required: true },
				{ name: "active", type: "bool" },
				{ name: "created", type: "autodate", onCreate: true },
			],
			indexes: ["CREATE UNIQUE INDEX idx_share_token ON share_links (token)"],
		});
		app.save(shareLinks);
	},
	(app) => {
		app.delete(app.findCollectionByNameOrId("share_links"));
		app.delete(app.findCollectionByNameOrId("meals"));
	},
);
