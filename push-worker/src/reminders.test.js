import assert from "node:assert/strict";
import test from "node:test";
import {
	isDuplicateDeliveryError,
	isReminderDue,
	localDateTime,
	mealWasRegistered,
} from "./reminders.js";

test("uses the user's time zone", () => {
	assert.deepEqual(
		localDateTime(new Date("2026-08-15T07:30:00Z"), "Europe/Madrid"),
		{
			day: "2026-08-15",
			time: "09:30",
		},
	);
});

test("only becomes due between the configured time and window end", () => {
	const preference = { enabled: true, time: "09:30", windowEnd: "10:00" };
	assert.equal(isReminderDue(preference, "09:29"), false);
	assert.equal(isReminderDue(preference, "09:30"), true);
	assert.equal(isReminderDue(preference, "10:01"), false);
});

test("only a meal of the matching type suppresses the reminder", () => {
	const meals = [
		{
			entry_type: "water",
			meal_type: "desayuno",
			eaten_at: "2026-08-15 07:00:00.000Z",
		},
		{
			entry_type: "meal",
			meal_type: "comida",
			eaten_at: "2026-08-15 12:00:00.000Z",
		},
	];
	assert.equal(
		mealWasRegistered(meals, "desayuno", "2026-08-15", "Europe/Madrid"),
		false,
	);
	assert.equal(
		mealWasRegistered(meals, "comida", "2026-08-15", "Europe/Madrid"),
		true,
	);
});

test("only treats unique-index violations as duplicate deliveries", () => {
	assert.equal(
		isDuplicateDeliveryError({
			status: 400,
			response: { data: { user: { code: "validation_not_unique" } } },
		}),
		true,
	);
	assert.equal(
		isDuplicateDeliveryError({
			status: 400,
			response: { data: { user: { code: "validation_required" } } },
		}),
		false,
	);
	assert.equal(isDuplicateDeliveryError({ status: 500 }), false);
});
