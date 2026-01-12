import { json } from '@sveltejs/kit';
import { polarFetch } from '$lib/server/polar.js';

const DAYS = 7;
const DAILY_MAX_GROWTH = 100 / DAYS; // 14.285714...

export async function GET({ cookies }) {
	try {
		// Fetch sleep data from Polar
		const sleeps = await polarFetch('users/sleep', cookies);

		const list = Array.isArray(sleeps) ? sleeps : (sleeps.sleep ?? []);

		// Take the last 7 nights only
		const last7 = list.slice(0, DAYS);

		let totalGrowth = 0;

		for (const night of last7) {
			const sleepScore = night.sleep_score ?? 0; // 0–100

			// Daily contribution (monotonic, no decay)
			const dailyContribution = (sleepScore / 100) * DAILY_MAX_GROWTH;

			totalGrowth += dailyContribution;
		}

		// Normalize to 0 → 1
		const growth = Math.min(totalGrowth / 100, 1);

		return json({
			totalGrowth, // percentage (0–100)
			growth // normalized (0–1)
		});
	} catch (err) {
		console.error('[sleep-coral]', err);
		return json({ error: err.message ?? 'Failed to load sleep coral data' }, { status: 500 });
	}
}
