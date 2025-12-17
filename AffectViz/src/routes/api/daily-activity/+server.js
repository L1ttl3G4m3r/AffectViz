import { polarFetch } from '$lib/polar.js';

export async function GET({ cookies }) {
  try {
    const data = await polarFetch('users/activities', cookies);
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[API] Daily activity fetch failed:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
