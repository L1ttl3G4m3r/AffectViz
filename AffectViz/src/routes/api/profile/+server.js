import { json } from '@sveltejs/kit';
import { getPolarAccessToken } from '$lib/server/polar.js';

export async function GET({ cookies }) {
  try {
    const token = await getPolarAccessToken(cookies);
    const polarUserId = cookies.get('polar_user_id');

    if (!polarUserId) {
      return json({ error: 'Missing Polar user id' }, { status: 400 });
    }

    const res = await fetch(`https://www.polaraccesslink.com/v3/users/${polarUserId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (res.status === 404) {
      // User exists but no profile data yet
      return json({ message: 'No profile data available' });
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Polar API error: ${res.status} ${text}`);
    }

    const profile = await res.json();
    return json(profile);

  } catch (err) {
    console.error('[API] Profile fetch failed:', err);
    return json({ error: err.message ?? 'Unknown error' });
  }
}
