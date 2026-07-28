/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const users = app.findCollectionByNameOrId("users");
		const preferences = new Collection({
			type: "base",
			name: "user_preferences",
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
				{
					name: "preferences",
					type: "json",
					required: true,
					maxSize: 100000,
				},
				{ name: "created", type: "autodate", onCreate: true },
				{ name: "updated", type: "autodate", onCreate: true, onUpdate: true },
			],
			indexes: [
				"CREATE UNIQUE INDEX idx_user_preferences_user ON user_preferences (user)",
			],
		});
		app.save(preferences);
	},
	(app) => {
		app.delete(app.findCollectionByNameOrId("user_preferences"));
	},
);
