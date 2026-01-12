import { json } from '@sveltejs/kit';
import { polarFetch } from '$lib/server/polar.js';

const DAYS = 7;
const DAILY_GOAL_MINUTES = 60;

export async function GET({ cookies }) {
	try {
		// Fetch training sessions
		const activities = await polarFetch('users/training-sessions', cookies);

		const list = Array.isArray(activities) ? activities : (activities.training_sessions ?? []);

		// Group total duration per day (in minutes)
		const durationByDate = {};

		for (const session of list) {
			const date = session.start_time?.split('T')[0];
			if (!date) continue;

			const durationMinutes = (session.duration ?? 0) / 60;

			durationByDate[date] = (durationByDate[date] ?? 0) + durationMinutes;
		}

		// Build last 7 days plume visibility
		const today = new Date();
		const plumes = [];

		for (let i = 0; i < DAYS; i++) {
			const d = new Date(today);
			d.setDate(today.getDate() - i);
			const key = d.toISOString().split('T')[0];

			const minutes = durationByDate[key] ?? 0;
			plumes.push(minutes >= DAILY_GOAL_MINUTES);
		}

		return json({
			plumes // array of booleans, length 7
		});
	} catch (err) {
		console.error('[workout-coral]', err);
		return json({ error: err.message ?? 'Failed to load workout coral data' }, { status: 500 });
	}
}
