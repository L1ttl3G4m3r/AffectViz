<script>
  import { onMount } from 'svelte';

  let sleep = [];
  let error = null;
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch('/api/sleep', {
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Failed to fetch sleep data');
      }

      const data = await res.json();

      if (data?.error) {
        error = data.error;
        sleep = [];
      } else {
        sleep = data;
      }

    } catch (err) {
      error = err.message;
      sleep = [];
    } finally {
      loading = false;
    }
  });
</script>

<div>
  <h2>Sleep (last 7 days)</h2>

  {#if loading}
    <p>Loading...</p>

  {:else if error}
    <p class="error">{error}</p>

  {:else if sleep.length === 0}
    <p>No sleep data available</p>

  {:else}
    <ul>
      {#each sleep as sl}
        <li>
          <strong>Date:</strong> {sl.date}<br />
          <strong>Start:</strong> {sl.sleep_start_time ?? 'N/A'}<br />
          <strong>End:</strong> {sl.sleep_end_time ?? 'N/A'}<br />
          <strong>Light sleep:</strong> {sl.light_sleep ?? 'N/A'} min<br />
          <strong>Deep sleep:</strong> {sl.deep_sleep ?? 'N/A'} min<br />
          <strong>REM sleep:</strong> {sl.rem_sleep ?? 'N/A'} min<br />
          <strong>Sleep score:</strong> {sl.sleep_score ?? 'N/A'}<br />
          <strong>Interruptions:</strong> {sl.total_interruption_duration ?? 'N/A'} min
        </li>
      {/each}
    </ul>
  {/if}
</div>
