import { polarFetch } from '$lib/polar.js';

export async function GET({ cookies }) {
  try {
    const exercisesList = await polarFetch('exercises', cookies);
    if (!Array.isArray(exercisesList) || exercisesList.length === 0) {
      return new Response(JSON.stringify({ error: 'No exercises found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // pick latest exercise
    const latest = exercisesList.sort((a,b) => new Date(b.upload_time) - new Date(a.upload_time))[0];
    const latestExercise = await polarFetch(`exercises/${latest.id}`, cookies);

    return new Response(JSON.stringify(latestExercise), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[API] Activity fetch failed:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
