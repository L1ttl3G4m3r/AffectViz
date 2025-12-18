import { json } from '@sveltejs/kit';
import { fetchSleepData } from '$lib/server/polar.js';

export async function GET({ cookies }) {
  try {
    const data = await fetchSleepData(cookies);
    if (!data) return json({ message: 'No sleep data available' });
    return json(data);
  } catch (err) {
    console.error('[API] Sleep fetch failed:', err);
    return json({ error: err.message ?? 'Unknown error' });
  }
}
