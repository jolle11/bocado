/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const meals = app.findCollectionByNameOrId("meals");
		meals.fields.add(
			new BoolField({
				name: "unfinished",
			}),
		);
		meals.fields.add(
			new TextField({
				name: "unfinished_note",
				max: 500,
			}),
		);
		app.save(meals);
	},
	(app) => {
		const meals = app.findCollectionByNameOrId("meals");
		meals.fields.removeByName("unfinished_note");
		meals.fields.removeByName("unfinished");
		app.save(meals);
	},
);
