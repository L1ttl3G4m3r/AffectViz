import { json } from '@sveltejs/kit';
import { fetchNightlyRecharge } from '$lib/server/polar.js';

export async function GET({ cookies }) {
  try {
    const data = await fetchNightlyRecharge(cookies);
    if (!data) return json({ message: 'No nightly recharge data' });
    return json(data);
  } catch (err) {
    console.error('[API] Nightly recharge fetch failed:', err);
    return json({ error: err.message ?? 'Unknown error' });
  }
}
