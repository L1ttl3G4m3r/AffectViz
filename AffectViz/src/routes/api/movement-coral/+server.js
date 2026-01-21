import { json } from '@sveltejs/kit';
import { polarFetch } from '$lib/server/polar.js';

/* Steps goal used for weekly growth progress */
const DAILY_STEP_TARGET = 10_000;
const DAYS_PER_WEEK = 7;
const WEEKLY_TARGET = DAILY_STEP_TARGET * DAYS_PER_WEEK;

/* Day labels shown in the UI chart (Mon–Sun) */
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* Timezone used for consistent week calculation + date keys */
const NL_TIMEZONE = 'Europe/Amsterdam';

/*
 	Convert any date/time value into a NL-local YYYY-MM-DD string.
 	(Uses locale "en-CA" because it produces YYYY-MM-DD format.)
 */
function toNLDateKey(date) {
	return new Date(date).toLocaleDateString('en-CA', {
		timeZone: NL_TIMEZONE
	});
}

/*
 	Get the current Date in the NL timezone (not system timezone).
 */
function getNowInNL() {
	return new Date(
		new Date().toLocaleString('en-US', {
			timeZone: NL_TIMEZONE
		})
	);
}

/*
 	Get Monday 00:00 of the current week in NL timezone.
 	(Week starts on Monday.)
 */
function getMondayStartInNL() {
	const now = getNowInNL();

	/* JS getDay(): 0 = Sunday, 1 = Monday, ... 6 = Saturday */
	const dayOfWeek = now.getDay();

	/* Convert current day into a shift that moves to Monday */
	const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

	now.setDate(now.getDate() + diffToMonday);
	now.setHours(0, 0, 0, 0);

	return now;
}

/*
	Ensure we always end up with a usable activities array.
 */
function normalizeActivityList(apiResponse) {
	if (Array.isArray(apiResponse)) return apiResponse;
	return apiResponse?.activities ?? [];
}

/*
 	Build two lookups:
 	- stepsPerDay[dateKey] = total steps that day
 	- caloriesPerDay[dateKey] = total calories that day
 */
function buildDailyTotals(activities) {
	const stepsPerDay = {};
	const caloriesPerDay = {};

	for (const day of activities) {
		if (!day?.start_time) continue;

		const dateKey = toNLDateKey(day.start_time);

		stepsPerDay[dateKey] = (stepsPerDay[dateKey] ?? 0) + (day.steps ?? 0);
		caloriesPerDay[dateKey] = (caloriesPerDay[dateKey] ?? 0) + (day.calories ?? 0);
	}

	return { stepsPerDay, caloriesPerDay };
}

/*
 	Create the Mon–Sun dataset used for the weekly graph.
 */
function buildStepsByDay({ monday, stepsPerDay }) {
	const stepsByDay = [];

	for (let i = 0; i < DAYS_PER_WEEK; i++) {
		const date = new Date(monday);
		date.setDate(monday.getDate() + i);

		const dateKey = toNLDateKey(date);

		stepsByDay.push({
			label: DAY_LABELS[i],
			date: dateKey,
			steps: Math.round(stepsPerDay[dateKey] ?? 0)
		});
	}

	return stepsByDay;
}

/* ============================================================
   GET /api/... ENDPOINT
   ============================================================ */

export async function GET({ cookies }) {
	try {
		/* Fetch raw activity data from Polar */
		const activitiesResponse = await polarFetch('users/activities', cookies);
		const activities = normalizeActivityList(activitiesResponse);

		/* Total steps for the entire activity list (used for growth calculation) */
		const totalSteps = activities.reduce((sum, day) => sum + (day.steps ?? 0), 0);

		/*
			Growth represents progress toward the weekly goal (0..1)
			Example: 0.5 = 50% of weekly target
		*/
		const growth = Math.min(totalSteps / WEEKLY_TARGET, 1);

		/* Build per-day totals (lookup tables) */
		const { stepsPerDay, caloriesPerDay } = buildDailyTotals(activities);

		/* Build current week graph data (Mon–Sun in NL timezone) */
		const monday = getMondayStartInNL();
		const todayKey = toNLDateKey(new Date());

		const stepsByDay = buildStepsByDay({ monday, stepsPerDay });

		/* Find today's position in the chart (0..6) */
		const todayIndex = stepsByDay.findIndex((d) => d.date === todayKey);

		/* Today-specific values */
		const todaySteps = todayIndex >= 0 ? stepsByDay[todayIndex].steps : 0;
		const calories = Math.round(caloriesPerDay[todayKey] ?? 0);

		/* Optional: delta compared to yesterday */
		let deltaFromYesterday = null;

		if (todayIndex > 0) {
			const yesterdaySteps = stepsByDay[todayIndex - 1]?.steps ?? 0;
			deltaFromYesterday = todaySteps - yesterdaySteps;
		}

		/* Send data to frontend */
		return json({
			totalSteps,
			weeklyTarget: WEEKLY_TARGET,
			growth,

			/* Used in your overlay stats card */
			calories,

			/* Used for your D3 chart */
			stepsByDay,
			todayIndex,
			todaySteps,
			deltaFromYesterday
		});
	} catch (err) {
		console.error('[movement-coral]', err);

		return json({ error: err?.message ?? 'Failed to load movement coral data' }, { status: 500 });
	}
}
