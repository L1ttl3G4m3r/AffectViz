import { json } from '@sveltejs/kit';
import { fetchProfile } from '$lib/server/polar.js';

export async function GET({ cookies }) {
  try {
    const data = await fetchProfile(cookies);
    if (!data) return json({ message: 'No profile data available' });
    return json(data);
  } catch (err) {
    console.error('[API] Profile fetch failed:', err);
    return json({ error: err.message ?? 'Unknown error' });
  }
}
