import { json } from '@sveltejs/kit';
import { fetchPhysicalInfo } from '$lib/server/polar.js';

export async function GET({ cookies }) {
  try {
    const data = await fetchPhysicalInfo(cookies);
    if (!data) return json({ message: 'No physical info available' });
    return json(data);
  } catch (err) {
    console.error('[API] Physical info fetch failed:', err);
    return json({ error: err.message ?? 'Unknown error' });
  }
}
