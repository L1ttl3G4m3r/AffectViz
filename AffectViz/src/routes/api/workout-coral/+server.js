import { json } from '@sveltejs/kit';
import { polarFetch } from '$lib/server/polar.js';

const NL_TIMEZONE = 'Europe/Amsterdam';
const DAYS_PER_WEEK = 7;
const DAILY_GOAL_MINUTES = 60;

/*
 	Convert ISO-8601 duration string to minutes.
 	Example: "PT1H30M" -> 90
 */
function durationToMinutes(duration) {
	if (!duration || typeof duration !== 'string') return 0;

	const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/);
	if (!match) return 0;

	const hours = Number(match[1] ?? 0);
	const minutes = Number(match[2] ?? 0);
	const seconds = Number(match[3] ?? 0);

	return hours * 60 + minutes + seconds / 60;
}

/* Convert a Date into a NL-local YYYY-MM-DD string. */
function toNLDateKey(date) {
	return new Date(date).toLocaleDateString('en-CA', { timeZone: NL_TIMEZONE });
}

/* Get "now" in NL timezone (important for weekly calculations). */
function getNowInNL() {
	return new Date(new Date().toLocaleString('en-US', { timeZone: NL_TIMEZONE }));
}

/* Get Monday 00:00 of the current week (NL timezone). */
function getMondayStartInNL() {
	const now = getNowInNL();

	/* JS: 0 = Sunday, 1 = Monday, ... */
	const dayOfWeek = now.getDay();
	const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

	now.setDate(now.getDate() + diffToMonday);
	now.setHours(0, 0, 0, 0);

	return now;
}

/* Normalize Polar exercise API response into an array. */
function normalizeExercises(apiResponse) {
	if (Array.isArray(apiResponse)) return apiResponse;
	return apiResponse?.exercises ?? [];
}

export async function GET({ cookies }) {
	try {
		/* Fetch exercise list from Polar */
		const response = await polarFetch('exercises', cookies);
		const exercises = normalizeExercises(response);

		/* Total workout minutes per day (for the weekly plume visibility) */
		const minutesPerDay = {};

		/* Today-only totals (for the workout overlay stats) */
		const todayKey = toNLDateKey(new Date());
		let workoutCalories = 0;
		let workoutDurationMinutes = 0;

		/* Weighted average heart rate calculation */
		let heartRateMinutesSum = 0;
		let heartRateWeightedSum = 0;

		/* Parse exercise data */
		for (const ex of exercises) {
			if (!ex?.start_time || !ex?.duration) continue;

			const dateKey = toNLDateKey(ex.start_time);
			const minutes = durationToMinutes(ex.duration);

			/* Weekly total per day (existing logic) */
			minutesPerDay[dateKey] = (minutesPerDay[dateKey] ?? 0) + minutes;

			/* Today totals only */
			if (dateKey === todayKey) {
				workoutDurationMinutes += minutes;
				workoutCalories += ex.calories ?? 0;

				const avgHr = ex?.heart_rate?.average;

				/* Weighted average: (avgHr * minutes) / totalMinutes */
				if (typeof avgHr === 'number' && avgHr > 0) {
					heartRateMinutesSum += minutes;
					heartRateWeightedSum += avgHr * minutes;
				}
			}
		}

		/* ========================================================
		   Build weekly plume list (Mon–Sun)
		   ======================================================== */
		const monday = getMondayStartInNL();
		const plumes = [];

		for (let i = 0; i < DAYS_PER_WEEK; i++) {
			const date = new Date(monday);
			date.setDate(monday.getDate() + i);

			const dateKey = toNLDateKey(date);
			const minutes = Math.round(minutesPerDay[dateKey] ?? 0);

			plumes.push({
				date: dateKey,
				minutes,

				/*
					visible:
					- only show plumes for days up to today
					- show if goal minutes reached
				*/
				visible: dateKey <= todayKey && minutes >= DAILY_GOAL_MINUTES
			});
		}

		/* Average heart rate (today only) */
		const avgHeartRate =
			heartRateMinutesSum > 0 ? Math.round(heartRateWeightedSum / heartRateMinutesSum) : null;

		/* Response */
		return json({
			weekStart: toNLDateKey(monday),
			dailyGoalMinutes: DAILY_GOAL_MINUTES,
			plumes,

			/* Today stats */
			workoutCalories: Math.round(workoutCalories),
			workoutDurationMinutes: Math.round(workoutDurationMinutes),
			avgHeartRate
		});
	} catch (err) {
		console.error('[workout-coral] Failed:', err);

		return json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
	}
}
