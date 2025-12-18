import { json } from '@sveltejs/kit';
import { fetchDailyActivity } from '$lib/server/polar.js';

export async function GET({ cookies }) {
  try {
    const activity = await fetchDailyActivity(cookies);
    if (!activity) return json({ message: 'No daily activity data' });
    return json(activity);
  } catch (err) {
    console.error('[API] Daily activity fetch failed:', err);
    return json({ error: err.message ?? 'Unknown error' });
  }
}
