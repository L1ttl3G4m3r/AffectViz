// src/routes/activity/+server.js
import { json } from '@sveltejs/kit';
import { polarFetch } from '$lib/server/polar.js';

export async function GET({ cookies }) {
  try {
    // Fetch daily activities — this returns an array of daily summaries
    const activities = await polarFetch('users/activities', cookies);

    // If for some reason it returns an object with array inside
    const result = Array.isArray(activities)
      ? activities
      : activities.activities ?? [];

    return json(result);

  } catch (err) {
    console.error('[API] Failed to list daily activities:', err);
    return json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
