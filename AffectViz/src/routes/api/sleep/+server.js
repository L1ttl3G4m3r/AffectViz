import { json } from '@sveltejs/kit';
import { polarFetch } from '$lib/server/polar.js';

export async function GET({ cookies }) {
  try {
    // Fetch the raw list of sleep data
    const sleep = await polarFetch('users/sleep', cookies);

    // Ensure we always return an array (empty if none)
    const result = Array.isArray(sleep) ? sleep : sleep.sleep ?? [];

    return json(result);

  } catch (err) {
    console.error('[API] Failed to list exercises:', err);
    return json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
