import { json } from '@sveltejs/kit';
import { polarFetch } from '$lib/server/polar.js';

/* Weighting for the final overall score */
const SLEEP_WEIGHT = 0.55;
const CARDIO_WEIGHT = 0.45;

/* Clamp a number between a minimum and maximum. */
function clamp(value, min = 0, max = 100) {
	return Math.max(min, Math.min(max, value));
}

/* Convert a score into a safe 0–100 value. */
function normalizeSleepScore(score) {
	return clamp(score);
}

/*
 	Convert Polar cardio load into a 0–100-ish score.
 	(Keeps your original mapping logic exactly the same.)
 */
function normalizeCardioLoad(load) {
	if (load <= 0) return 50;
	if (load <= 20) return 35;
	if (load <= 50) return 55;
	if (load <= 90) return 75;
	if (load <= 130) return 90;
	return 70;
}

/*
 	Get today's date formatted as YYYY-MM-DD.
 	(Matches Polar API format.)
 */
function getTodayDateKey() {
	return new Date().toISOString().slice(0, 10);
}

/* ============================================================
   ROUTE HANDLER
   ============================================================ */

export async function GET({ cookies }) {
	try {
		const today = getTodayDateKey();

		/* Sleep */
		const sleep = await polarFetch(`users/sleep/${today}`, cookies);
		const sleepScore = normalizeSleepScore(sleep?.sleep_score ?? 0);

		/* Cardio Load */
		const cardio = await polarFetch(`users/cardio-load/${today}`, cookies);
		const cardioScore = normalizeCardioLoad(cardio?.cardio_load ?? 0);

		/* Overall Score (original weighting) */
		const overallScore = Math.round(sleepScore * SLEEP_WEIGHT + cardioScore * CARDIO_WEIGHT);

		return json({
			date: today,
			sleepScore,
			cardioScore,
			overallScore
		});
	} catch (err) {
		console.error('[overall-score] failed:', err);

		return json({ error: err?.message ?? 'Failed to compute score' }, { status: 500 });
	}
}
