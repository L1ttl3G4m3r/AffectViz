import { json } from '@sveltejs/kit';
import { polarFetch } from '$lib/server/polar.js';

const DAYS = 7;
const DAILY_MAX_GROWTH = 100 / DAYS; // 14.2857...
const SLEEP_STATES = 14; // sleep-0.png → sleep-13.png

export async function GET({ cookies }) {
	try {
		// Fetch sleep data from Polar
		const sleeps = await polarFetch('users/sleep', cookies);

		const list = Array.isArray(sleeps) ? sleeps : (sleeps.sleep ?? []);

		// Take the last 7 nights
		const last7 = list.slice(0, DAYS);

		let totalGrowth = 0;

		for (const night of last7) {
			const sleepScore = night.sleep_score ?? 0; // 0–100

			// Daily contribution (monotonic, no decay)
			const dailyContribution = (sleepScore / 100) * DAILY_MAX_GROWTH;

			totalGrowth += dailyContribution;
		}

		// Clamp to 0–100
		totalGrowth = Math.min(totalGrowth, 100);

		// Normalize to 0–1
		const growth = totalGrowth / 100;

		// ✅ Map growth → sleep state (0–13)
		const sleepState = Math.min(SLEEP_STATES - 1, Math.round(growth * (SLEEP_STATES - 1)));

		return json({
			totalGrowth, // 0–100
			growth, // 0–1
			sleepState // 0–13 (FINAL ANSWER)
		});
	} catch (err) {
		console.error('[sleep-coral]', err);
		return json({ error: err.message ?? 'Failed to load sleep coral data' }, { status: 500 });
	}
}
