/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId("share_links");
		collection.fields.add(new DateField({ name: "visible_from" }));
		collection.fields.add(new DateField({ name: "visible_until" }));
		app.save(collection);
	},
	(app) => {
		const collection = app.findCollectionByNameOrId("share_links");
		collection.fields.removeByName("visible_from");
		collection.fields.removeByName("visible_until");
		app.save(collection);
	},
);
