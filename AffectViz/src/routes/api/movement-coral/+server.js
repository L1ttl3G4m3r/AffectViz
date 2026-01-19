import { json } from '@sveltejs/kit';
import { polarFetch } from '$lib/server/polar.js';

const DAILY_STEP_TARGET = 10000;
const DAYS = 7;
const WEEKLY_TARGET = DAILY_STEP_TARGET * DAYS;

/* -------------------------------------------------
   Convert date to NL-local YYYY-MM-DD
-------------------------------------------------- */
function toNLDate(date) {
	return new Date(date).toLocaleDateString('en-CA', {
		timeZone: 'Europe/Amsterdam'
	});
}

/* -------------------------------------------------
   Get Monday of current week (NL timezone)
-------------------------------------------------- */
function getMondayNL() {
	const now = new Date(
		new Date().toLocaleString('en-US', {
			timeZone: 'Europe/Amsterdam'
		})
	);

	const day = now.getDay(); // 0 = Sun
	const diff = day === 0 ? -6 : 1 - day; // move to Monday

	now.setDate(now.getDate() + diff);
	now.setHours(0, 0, 0, 0);

	return now;
}

/* -------------------------------------------------
   Day labels (Mon–Sun)
-------------------------------------------------- */
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export async function GET({ cookies }) {
	try {
		const activities = await polarFetch('users/activities', cookies);
		const list = Array.isArray(activities) ? activities : (activities.activities ?? []);

		// ✅ total steps (for growth)
		const totalSteps = list.reduce((sum, day) => sum + (day.steps ?? 0), 0);
		const growth = Math.min(totalSteps / WEEKLY_TARGET, 1);

		// ✅ Build lookup per date (YYYY-MM-DD)
		const stepsPerDay = {};
		const caloriesPerDay = {};

		for (const day of list) {
			if (!day?.start_time) continue;

			const dateKey = toNLDate(day.start_time);

			stepsPerDay[dateKey] = (stepsPerDay[dateKey] ?? 0) + (day.steps ?? 0);
			caloriesPerDay[dateKey] = (caloriesPerDay[dateKey] ?? 0) + (day.calories ?? 0);
		}

		// ✅ Current week Mon–Sun (NL timezone)
		const monday = getMondayNL();
		const todayKey = toNLDate(new Date());

		const stepsByDay = [];

		for (let i = 0; i < 7; i++) {
			const d = new Date(monday);
			d.setDate(monday.getDate() + i);

			const dateKey = toNLDate(d);

			stepsByDay.push({
				label: DAY_LABELS[i],
				date: dateKey,
				steps: Math.round(stepsPerDay[dateKey] ?? 0)
			});
		}

		// ✅ Today index (0–6)
		const todayIndex = stepsByDay.findIndex((d) => d.date === todayKey);

		// ✅ Today stats
		const todaySteps = todayIndex >= 0 ? stepsByDay[todayIndex].steps : 0;
		const calories = Math.round(caloriesPerDay[todayKey] ?? 0);

		// ✅ Yesterday delta (nice for the UI, optional)
		let deltaFromYesterday = null;
		if (todayIndex > 0) {
			const yesterdaySteps = stepsByDay[todayIndex - 1]?.steps ?? 0;
			deltaFromYesterday = todaySteps - yesterdaySteps;
		}

		return json({
			totalSteps,
			weeklyTarget: WEEKLY_TARGET,
			growth,

			// ✅ Existing stat you already use in overlay
			calories,

			// ✅ NEW graph data
			stepsByDay,
			todayIndex,
			todaySteps,
			deltaFromYesterday
		});
	} catch (err) {
		console.error('[movement-coral]', err);
		return json({ error: err.message ?? 'Failed to load movement coral data' }, { status: 500 });
	}
}
