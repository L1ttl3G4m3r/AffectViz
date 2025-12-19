import { json } from '@sveltejs/kit';
import { polarFetch } from '$lib/server/polar.js';

export async function GET({ cookies }) {
  try {
    // Fetch the raw list of exercises
    const exercises = await polarFetch('exercises', cookies);

    // Ensure we always return an array (empty if none)
    const result = Array.isArray(exercises) ? exercises : exercises.exercises ?? [];

    return json(result);

  } catch (err) {
    console.error('[API] Failed to list exercises:', err);
    return json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
