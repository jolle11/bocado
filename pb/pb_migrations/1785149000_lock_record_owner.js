/// <reference path="../pb_data/types.d.ts" />
// Impide reasignar registros a otro usuario cambiando `user` en un update.
const OWNED = ["meals", "share_links", "push_subscriptions", "user_preferences"];
const OLD_RULE = "user = @request.auth.id";
const NEW_RULE =
	"user = @request.auth.id && (@request.body.user:isset = false || @request.body.user = @request.auth.id)";

migrate(
	(app) => {
		for (const name of OWNED) {
			const collection = app.findCollectionByNameOrId(name);
			collection.updateRule = NEW_RULE;
			app.save(collection);
		}
	},
	(app) => {
		for (const name of OWNED) {
			const collection = app.findCollectionByNameOrId(name);
			collection.updateRule = OLD_RULE;
			app.save(collection);
		}
	},
);
