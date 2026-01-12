import { json } from '@sveltejs/kit';
import { polarFetch } from '$lib/server/polar.js';

/* ---------------- Utilities ---------------- */

/**
 * Convert ISO-8601 duration (PT2H44M, PT45M, PT1H)
 * into total minutes
 */
function durationToMinutes(duration) {
	if (!duration || typeof duration !== 'string') return 0;

	let minutes = 0;

	const hoursMatch = duration.match(/(\d+)H/);
	const minutesMatch = duration.match(/(\d+)M/);

	if (hoursMatch) minutes += parseInt(hoursMatch[1], 10) * 60;
	if (minutesMatch) minutes += parseInt(minutesMatch[1], 10);

	return minutes;
}

/* ---------------- Handler ---------------- */

export async function GET({ cookies }) {
	try {
		/**
		 * Polar exercises endpoint returns workouts
		 * for roughly the last 30 days
		 */
		const exercises = await polarFetch('exercises', cookies);

		/**
		 * Group total workout minutes per day
		 * {
		 *   '2024-03-18': 72,
		 *   '2024-03-19': 45
		 * }
		 */
		const minutesPerDay = {};

		for (const ex of exercises ?? []) {
			const date = ex.start_time?.slice(0, 10);
			if (!date) continue;

			const minutes = durationToMinutes(ex.duration);

			minutesPerDay[date] = (minutesPerDay[date] ?? 0) + minutes;
		}

		/**
		 * Workout goal:
		 * 60 minutes per day
		 * 7 plumes = 7 days
		 */
		const WEEK_DAYS = 7;
		const DAILY_GOAL_MINUTES = 60;

		const today = new Date();
		const plumes = [];

		for (let i = 0; i < WEEK_DAYS; i++) {
			const d = new Date(today);
			d.setDate(today.getDate() - i);

			const dateKey = d.toISOString().slice(0, 10);
			const minutes = minutesPerDay[dateKey] ?? 0;

			plumes.unshift({
				date: dateKey,
				minutes,
				visible: minutes >= DAILY_GOAL_MINUTES
			});
		}

		return json({
			dailyGoalMinutes: DAILY_GOAL_MINUTES,
			plumes
		});
	} catch (err) {
		console.error('[workout-coral] Failed to load workout data:', err);

		return json(
			{
				error: err.message ?? 'Failed to load workout coral data'
			},
			{ status: 500 }
		);
	}
}
