import { json } from '@sveltejs/kit';
import { polarFetch } from '$lib/server/polar.js';

/* How many nights we look back for weekly growth */
const DAYS_PER_WEEK = 7;

/* Daily growth contribution if sleepScore = 100 */
const DAILY_MAX_GROWTH = 100 / DAYS_PER_WEEK;

/* Number of coral growth states (0..13) */
const SLEEP_STATES = 14;

/*
 	Format a sleep session duration as "Xh Ym".
 	Returns "–" if inputs are missing or invalid.
 */
function formatSleepDuration(start, end) {
	if (!start || !end) return '–';

	const startDate = new Date(start);
	const endDate = new Date(end);

	const diffMs = endDate - startDate;
	if (diffMs <= 0) return '–';

	const totalMinutes = Math.round(diffMs / 60000);
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	return `${hours}h ${minutes}m`;
}

/*
 	Convert minutes -> rounded hours.
 	(Polar returns durations in minutes, so we turn them into hours for your UI.)
 */
function minutesToHours(value) {
	return Math.round((value ?? 0) / 60);
}

/*
 	Calculate weekly growth from the last N nights.
 	Keeps the same logic: each night contributes a fraction of DAILY_MAX_GROWTH.
 */
function calculateSleepGrowth(lastNights) {
	let totalGrowth = 0;

	for (const night of lastNights) {
		const sleepScore = night?.sleep_score ?? 0;
		const dailyContribution = (sleepScore / 100) * DAILY_MAX_GROWTH;
		totalGrowth += dailyContribution;
	}

	/* Cap at 100 max */
	totalGrowth = Math.min(totalGrowth, 100);

	/* Convert to 0..1 range */
	const growth = totalGrowth / 100;

	return { totalGrowth, growth };
}

/* Convert growth (0..1) into a coral state index (0..SLEEP_STATES-1). */
function getSleepState(growth) {
	return Math.min(SLEEP_STATES - 1, Math.round(growth * (SLEEP_STATES - 1)));
}

export async function GET({ cookies }) {
	try {
		/* Fetch sleep history from Polar */
		const sleeps = await polarFetch('users/sleep', cookies);
		const nights = sleeps?.nights ?? [];

		/* Last 7 nights (unchanged logic: take newest first) */
		const last7 = nights.slice(0, DAYS_PER_WEEK);

		/* Weekly growth calculation */
		const { totalGrowth, growth } = calculateSleepGrowth(last7);

		/* Coral growth stage index */
		const sleepState = getSleepState(growth);

		/* Last night details (used for charts + overlay UI) */
		const lastNight = nights[0];

		const deepSleep = minutesToHours(lastNight?.deep_sleep);
		const remSleep = minutesToHours(lastNight?.rem_sleep);
		const lightSleep = minutesToHours(lastNight?.light_sleep);

		/* Interruption duration treated as awake time */
		const awake = minutesToHours(lastNight?.total_interruption_duration);

		const sleepScore = lastNight?.sleep_score ?? 0;
		const sleepDuration = formatSleepDuration(
			lastNight?.sleep_start_time,
			lastNight?.sleep_end_time
		);

		return json({
			totalGrowth,
			growth,
			sleepState,

			/* Last night stats */
			sleepScore,
			sleepDuration,
			deepSleep,
			remSleep,
			lightSleep,
			awake
		});
	} catch (err) {
		console.error('[sleep-coral]', err);

		return json({ error: err?.message ?? 'Failed to load sleep coral data' }, { status: 500 });
	}
}
