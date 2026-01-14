import { json } from '@sveltejs/kit';
import { polarFetch } from '$lib/server/polar.js';

const DAILY_STEP_TARGET = 10000;
const DAYS = 7;
const WEEKLY_TARGET = DAILY_STEP_TARGET * DAYS;

export async function GET({ cookies }) {
	try {
		const activities = await polarFetch('users/activities', cookies);

		const list = Array.isArray(activities) ? activities : (activities.activities ?? []);

		const totalSteps = list.reduce((sum, day) => sum + (day.steps ?? 0), 0);

		const growth = Math.min(totalSteps / WEEKLY_TARGET, 1);

		return json({
			totalSteps,
			weeklyTarget: WEEKLY_TARGET,
			growth
		});
	} catch (err) {
		console.error('[movement-coral]', err);
		return json({ error: err.message ?? 'Failed to load movement coral data' }, { status: 500 });
	}
}
