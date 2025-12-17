import { polarFetch } from '$lib/polar.js';

export async function GET({ cookies }) {
  try {
    const data = await polarFetch('users/~user', cookies);
    return new Response(JSON.stringify({
      height: data.height,
      weight: data.weight,
      restingHeartRate: data['resting-heart-rate'],
      maximumHeartRate: data['maximum-heart-rate'],
      vo2Max: data['vo2-max'] ?? null
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[API] Profile fetch failed:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
