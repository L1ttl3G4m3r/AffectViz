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

    const nightlyRechargeData = [];

    for (
      let d = new Date(weekAgo);
      d <= today;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = formatDate(d);

      try {
        const nr = await polarFetch(
          `users/nightly-recharge/${dateStr}`,
          cookies
        );

        if (nr?.date) {
          nightlyRechargeData.push(nr);
        }

        await delay(300);

      } catch (err) {
        // 404 = no nightly recharge that night
        if (err.status !== 404) {
          console.warn(
            `Nightly Recharge fetch failed for ${dateStr}`,
            err
          );
        }
      }
    }

    // newest first
    nightlyRechargeData.sort(
      (a, b) => b.date.localeCompare(a.date)
    );

    return json(nightlyRechargeData);

  } catch (err) {
    console.error('[API] Failed to fetch nightly recharge:', err);
    return json(
      { error: err.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
