import { json } from '@sveltejs/kit';
import { polarFetch } from '$lib/server/polar.js';

const DAYS = 7;
const DAILY_MAX_GROWTH = 100 / DAYS;
const SLEEP_STATES = 14;

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

export async function GET({ cookies }) {
	try {
		const sleeps = await polarFetch('users/sleep', cookies);

		const list = sleeps.nights ?? [];

		/* Last 7 nights (unchanged logic) */
		const last7 = list.slice(0, DAYS);

		let totalGrowth = 0;

		for (const night of last7) {
			const sleepScore = night.sleep_score ?? 0;
			const dailyContribution = (sleepScore / 100) * DAILY_MAX_GROWTH;
			totalGrowth += dailyContribution;
		}

		totalGrowth = Math.min(totalGrowth, 100);
		const growth = totalGrowth / 100;

		const sleepState = Math.min(SLEEP_STATES - 1, Math.round(growth * (SLEEP_STATES - 1)));

		/* 🔹 ADD: previous night details */
		const lastNight = list[0];

		const deepSleep = Math.round((lastNight?.deep_sleep ?? 0) / 60);
		const remSleep = Math.round((lastNight?.rem_sleep ?? 0) / 60);
		const lightSleep = Math.round((lastNight?.light_sleep ?? 0) / 60);

		const awake = Math.round((lastNight?.total_interruption_duration ?? 0) / 60);

		const sleepScore = lastNight?.sleep_score ?? 0;
		const sleepDuration = formatSleepDuration(
			lastNight?.sleep_start_time,
			lastNight?.sleep_end_time
		);

		return json({
			totalGrowth,
			growth,
			sleepState,
			sleepScore,
			sleepDuration,

			deepSleep,
			remSleep,
			lightSleep,
			awake
		});
	} catch (err) {
		console.error('[sleep-coral]', err);
		return json({ error: err.message ?? 'Failed to load sleep coral data' }, { status: 500 });
	}
}
