/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const meals = app.findCollectionByNameOrId("meals");
		meals.fields.add(
			new JSONField({
				name: "photos",
				maxSize: 25000,
			}),
		);
		app.save(meals);
	},
	(app) => {
		const meals = app.findCollectionByNameOrId("meals");
		meals.fields.removeByName("photos");
		app.save(meals);
	},
);
