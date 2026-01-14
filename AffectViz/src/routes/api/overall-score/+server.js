import { json } from '@sveltejs/kit';
import { polarFetch } from '$lib/server/polar.js';

/* ================= Utilities ================= */

const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));

function normalizeSleep(score) {
	return clamp(score);
}

function normalizeCardio(load) {
	if (load <= 0) return 50;
	if (load <= 20) return 35;
	if (load <= 50) return 55;
	if (load <= 90) return 75;
	if (load <= 130) return 90;
	return 70;
}

/* ================= Handler ================= */

export async function GET({ cookies }) {
	try {
		const today = new Date().toISOString().slice(0, 10);

		/* ---------- Sleep ---------- */
		const sleep = await polarFetch(`users/sleep/${today}`, cookies);
		const sleepScore = normalizeSleep(sleep?.sleep_score ?? 0);

		/* ---------- Cardio ---------- */
		const cardio = await polarFetch(`users/cardio-load/${today}`, cookies);
		const cardioScore = normalizeCardio(cardio?.cardio_load ?? 0);

		/* ---------- Overall (ORIGINAL BEHAVIOR) ---------- */
		const overallScore = Math.round(sleepScore * 0.55 + cardioScore * 0.45);

		return json({
			date: today,
			sleepScore,
			cardioScore,
			overallScore
		});
	} catch (err) {
		console.error('[overall-score] failed:', err);

		return json({ error: err.message ?? 'Failed to compute score' }, { status: 500 });
	}
}
