import { json } from '@sveltejs/kit';
import { polarFetch } from '$lib/server/polar.js';

/* -------------------------------------------------
   ISO-8601 Duration → Minutes
   Examples:
   - PT45M
   - PT1H30M
   - PT210.026S
-------------------------------------------------- */
function durationToMinutes(duration) {
	if (!duration || typeof duration !== 'string') return 0;

	const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/);

	if (!match) return 0;

	const hours = Number(match[1] ?? 0);
	const minutes = Number(match[2] ?? 0);
	const seconds = Number(match[3] ?? 0);

	return hours * 60 + minutes + seconds / 60;
}

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

	const day = now.getDay(); // 0=Sun, 1=Mon
	const diff = day === 0 ? -6 : 1 - day;

	now.setDate(now.getDate() + diff);
	now.setHours(0, 0, 0, 0);

	return now;
}

/* -------------------------------------------------
   GET handler
-------------------------------------------------- */
export async function GET({ cookies }) {
	try {
		// Fetch all exercises for the authenticated Polar user
		const response = await polarFetch('exercises', cookies);

		const exercises = Array.isArray(response) ? response : (response?.exercises ?? []);

		// Aggregate minutes per day
		const minutesPerDay = {};

		for (const ex of exercises) {
			if (!ex?.start_time || !ex?.duration) continue;

			const dateKey = toNLDate(ex.start_time);
			const minutes = durationToMinutes(ex.duration);

			minutesPerDay[dateKey] = (minutesPerDay[dateKey] ?? 0) + minutes;
		}

		const DAILY_GOAL_MINUTES = 60;
		const monday = getMondayNL();
		const todayKey = toNLDate(new Date());

		const plumes = [];

		// Build current week (Mon → Sun)
		for (let i = 0; i < 7; i++) {
			const d = new Date(monday);
			d.setDate(monday.getDate() + i);

			const dateKey = toNLDate(d);
			const minutes = Math.round(minutesPerDay[dateKey] ?? 0);

			plumes.push({
				date: dateKey,
				minutes,
				visible: dateKey <= todayKey && minutes >= DAILY_GOAL_MINUTES
			});
		}

		return json({
			weekStart: toNLDate(monday),
			dailyGoalMinutes: DAILY_GOAL_MINUTES,
			plumes
		});
	} catch (err) {
		console.error('[workout-coral] Failed:', err);
		return json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
	}
}
