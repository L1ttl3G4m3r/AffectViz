import { json } from '@sveltejs/kit';
import { fetchLatestExercise } from '$lib/server/polar.js';

export async function GET({ cookies }) {
  try {
    const exercise = await fetchLatestExercise(cookies);
    if (!exercise) return json({ message: 'No exercises available' });
    return json(exercise);
  } catch (err) {
    console.error('[API] Activity fetch failed:', err);
    return json({ error: err.message ?? 'Unknown error' });
  }
}
