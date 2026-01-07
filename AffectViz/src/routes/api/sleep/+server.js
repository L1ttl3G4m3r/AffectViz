import { json } from '@sveltejs/kit';
import { polarFetch } from '$lib/server/polar.js';

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function GET({ cookies }) {
  try {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);

    const sleepData = [];

    for (
      let d = new Date(weekAgo);
      d <= today;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = formatDate(d);

      try {
        const sleep = await polarFetch(
          `users/sleep/${dateStr}`,
          cookies
        );

        if (sleep?.sleep_start_time) {
          sleepData.push(sleep);
        }

        // prevent rate limiting
        await delay(300);

      } catch (err) {
        if (err.status !== 404) {
          console.warn(`Sleep fetch failed for ${dateStr}`, err);
        }
      }
    }

    // newest first
    sleepData.sort((a, b) => b.date.localeCompare(a.date));

    return json(sleepData);

  } catch (err) {
    console.error('[API] Failed to fetch sleep:', err);
    return json(
      { error: err.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
