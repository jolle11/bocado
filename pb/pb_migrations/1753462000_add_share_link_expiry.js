/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId("share_links");
		collection.fields.add(new DateField({ name: "expires_at" }));
		app.save(collection);
	},
	(app) => {
		const collection = app.findCollectionByNameOrId("share_links");
		collection.fields.removeByName("expires_at");
		app.save(collection);
	},
);
