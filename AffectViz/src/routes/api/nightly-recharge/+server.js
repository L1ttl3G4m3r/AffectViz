import { json } from '@sveltejs/kit';
import { polarFetch } from '$lib/server/polar.js';

export async function GET({ cookies }) {
  try {
    // Fetch the raw list of nightly recharge data
    const nightlyRecharge = await polarFetch('users/nightly-recharge', cookies);

    // Ensure we always return an array (empty if none)
    const result = Array.isArray(nightlyRecharge) ? nightlyRecharge : nightlyRecharge.nightly_recharge ?? [];

    return json(result);

  } catch (err) {
    console.error('[API] Failed to list exercises:', err);
    return json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
