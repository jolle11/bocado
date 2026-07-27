/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const meals = app.findCollectionByNameOrId("meals");
		meals.fields.add(
			new SelectField({
				name: "entry_type",
				maxSelect: 1,
				values: ["meal", "water", "extra"],
			}),
		);
		meals.fields.add(
			new NumberField({
				name: "water_ml",
				min: 0,
				max: 10000,
				onlyInt: true,
			}),
		);
		app.save(meals);
	},
	(app) => {
		const meals = app.findCollectionByNameOrId("meals");
		meals.fields.removeByName("water_ml");
		meals.fields.removeByName("entry_type");
		app.save(meals);
	},
);
