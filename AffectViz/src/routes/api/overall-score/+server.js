import { json } from '@sveltejs/kit';
import { polarFetch } from '$lib/server/polar.js';

/* ---------------- Utilities ---------------- */

function clamp(value, min = 0, max = 100) {
	return Math.max(min, Math.min(max, value));
}

/*
  Normalize DAILY cardio load into a 0–100 score.
  These ranges are intentionally conservative and UX-friendly.
*/
function normalizeDailyCardioLoad(load) {
	if (load <= 0) return 50; // rest day, neutral
	if (load <= 20) return 35; // very light
	if (load <= 50) return 55; // light training
	if (load <= 90) return 75; // productive
	if (load <= 130) return 90; // hard but OK
	return 70; // overreaching
}

/* ---------------- Handler ---------------- */

export async function GET({ cookies }) {
	try {
		const today = new Date().toISOString().slice(0, 10);

		/* ---------- Sleep (today) ---------- */
		const sleep = await polarFetch(`users/sleep/${today}`, cookies);

		const sleepScore = clamp(sleep?.sleep_score ?? 0);

		/* ---------- Cardio Load (today) ---------- */
		const cardio = await polarFetch(`users/cardio-load/${today}`, cookies);

		const rawCardioLoad = cardio?.cardio_load ?? 0;
		const cardioScore = normalizeDailyCardioLoad(rawCardioLoad);

		/* ---------- Overall Daily Score ---------- */
		const overallScore = Math.round(sleepScore * 0.55 + cardioScore * 0.45);

		return json({
			date: today,
			sleepScore,
			cardioScore,
			rawCardioLoad,
			overallScore
		});
	} catch (err) {
		console.error('[API] Failed to compute overall score:', err);

		return json(
			{
				error: err.message ?? 'Failed to compute overall score'
			},
			{ status: 500 }
		);
	}
}
