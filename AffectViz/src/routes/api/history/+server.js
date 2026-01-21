import { json } from '@sveltejs/kit';
import { polarFetch } from '$lib/server/polar.js';

const DAILY_STEP_TARGET = 10000;
const DAYS_IN_WEEK = 7;
const WEEKLY_STEP_TARGET = DAILY_STEP_TARGET * DAYS_IN_WEEK;

const SLEEP_STATES = 14;
const DAILY_MAX_SLEEP_GROWTH = 100 / DAYS_IN_WEEK;

const WORKOUT_GOAL_MINUTES = 60;

function toNLDate(date) {
	return new Date(date).toLocaleDateString('en-CA', {
		timeZone: 'Europe/Amsterdam'
	});
}

/**
 * Month Week Ranges:
 * week 1 = 1-7
 * week 2 = 8-14
 * week 3 = 15-21
 * week 4 = 22-end
 */
function getMonthWeekRange(week, date = new Date()) {
	const year = date.getFullYear();
	const month = date.getMonth(); // 0-11

	const startDay = week === 1 ? 1 : week === 2 ? 8 : week === 3 ? 15 : 22;

	/* endDay depends on week */
	let endDay;
	if (week === 1) endDay = 7;
	else if (week === 2) endDay = 14;
	else if (week === 3) endDay = 21;
	else {
		/* last day of month */
		endDay = new Date(year, month + 1, 0).getDate();
	}

	const start = new Date(year, month, startDay, 0, 0, 0, 0);
	const end = new Date(year, month, endDay, 23, 59, 59, 999);

	return { start, end };
}

function isDateInRange(dateStrYYYYMMDD, start, end) {
	const d = new Date(dateStrYYYYMMDD);
	return d >= start && d <= end;
}

export async function GET({ url, cookies }) {
	try {
		const weekParam = Number(url.searchParams.get('week') ?? 1);
		const week = [1, 2, 3, 4].includes(weekParam) ? weekParam : 1;

		const { start, end } = getMonthWeekRange(week);
		const startKey = toNLDate(start);
		const endKey = toNLDate(end);

		/* =========================================================
		   MOVEMENT (steps growth)
		========================================================= */
		const activities = await polarFetch('users/activities', cookies);
		const activityList = Array.isArray(activities) ? activities : (activities.activities ?? []);

		let movementTotalSteps = 0;

		for (const day of activityList) {
			if (!day?.start_time) continue;
			const dateKey = toNLDate(day.start_time);

			/* only include selected week range */
			if (dateKey < startKey || dateKey > endKey) continue;

			movementTotalSteps += day.steps ?? 0;
		}

		const movementGrowth = Math.min(movementTotalSteps / WEEKLY_STEP_TARGET, 1);

		/* =========================================================
		   SLEEP (sleep growth + state)
		========================================================= */
		const sleeps = await polarFetch('users/sleep', cookies);
		const nights = sleeps.nights ?? [];

		/* The sleep list is usually sorted newest first, so we filter by date range: */
		let sleepTotalGrowth = 0;
		let sleepNightsCounted = 0;

		for (const night of nights) {
			const nightStart = night?.sleep_start_time;
			if (!nightStart) continue;

			const dateKey = toNLDate(nightStart);
			if (dateKey < startKey || dateKey > endKey) continue;

			const sleepScore = night.sleep_score ?? 0;
			const dailyContribution = (sleepScore / 100) * DAILY_MAX_SLEEP_GROWTH;

			sleepTotalGrowth += dailyContribution;
			sleepNightsCounted += 1;
		}

		sleepTotalGrowth = Math.min(sleepTotalGrowth, 100);
		const sleepGrowth = sleepTotalGrowth / 100;

		const sleepState = Math.min(SLEEP_STATES - 1, Math.round(sleepGrowth * (SLEEP_STATES - 1)));

		/* =========================================================
		   WORKOUT (plumes)
		========================================================= */
		const exerciseRes = await polarFetch('exercises', cookies);
		const exercises = Array.isArray(exerciseRes) ? exerciseRes : (exerciseRes?.exercises ?? []);

		/* accumulate minutes per day for selected range */
		const minutesPerDay = {};

		function durationToMinutes(duration) {
			if (!duration || typeof duration !== 'string') return 0;

			/* Parse ISO 8601 duration format (e.g., PT1H30M45S) */
			const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/);
			if (!match) return 0;

			const hours = Number(match[1] ?? 0);
			const minutes = Number(match[2] ?? 0);
			const seconds = Number(match[3] ?? 0);

			return hours * 60 + minutes + seconds / 60;
		}

		for (const ex of exercises) {
			if (!ex?.start_time || !ex?.duration) continue;

			const dateKey = toNLDate(ex.start_time);

			if (dateKey < startKey || dateKey > endKey) continue;

			const minutes = durationToMinutes(ex.duration);
			minutesPerDay[dateKey] = (minutesPerDay[dateKey] ?? 0) + minutes;
		}

		/* create 7 plume slots for week range days */
		const plumes = [];
		const startDate = new Date(start);

		for (let i = 0; i < 7; i++) {
			const d = new Date(startDate);
			d.setDate(startDate.getDate() + i);

			/* if week 4 and month ends early, stop */
			if (d > end) break;

			const dateKey = toNLDate(d);
			const minutes = Math.round(minutesPerDay[dateKey] ?? 0);

			plumes.push({
				date: dateKey,
				minutes,
				visible: minutes >= WORKOUT_GOAL_MINUTES
			});
		}

		return json({
			week,
			range: {
				start: startKey,
				end: endKey
			},
			movement: {
				totalSteps: movementTotalSteps,
				weeklyTarget: WEEKLY_STEP_TARGET,
				growth: movementGrowth
			},
			sleep: {
				totalGrowth: sleepTotalGrowth,
				growth: sleepGrowth,
				sleepState,
				nightsCounted: sleepNightsCounted
			},
			workout: {
				dailyGoalMinutes: WORKOUT_GOAL_MINUTES,
				plumes
			}
		});
	} catch (err) {
		console.error('[history]', err);
		return json({ error: err.message ?? 'Failed to load history data' }, { status: 500 });
	}
}
