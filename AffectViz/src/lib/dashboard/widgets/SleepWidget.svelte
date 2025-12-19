<script>
  import { onMount } from 'svelte';

  let sleep = [];
  let error = null;
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch('/api/sleep', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch sleep data');
      const data = await res.json();

      if (data.error) {
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
  <h2>Sleep</h2>

  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if !sleep.length}
    <p>No sleep data available</p>
  {:else}
    <ul>
      {#each sleep as sl}
        <li>
          <strong>Date:</strong> {sl.date ?? 'N/A'} |
          <strong>Start time:</strong> {sl.start_time ?? 'N/A'} |
          <strong>End time:</strong> {sl.end_time ?? 'N/A'} |
          <strong>Light sleep:</strong> {sl.light_sleep ?? 'N/A'} |
          <strong>Deep sleep:</strong> {sl.deep_sleep ?? 'N/A'} |
          <strong>REM sleep:</strong> {sl.rem_sleep ?? 'N/A'} |
          <strong>Sleep score:</strong> {sl.sleep_score ?? 'N/A'} |
          <strong>Total interruption:</strong> {sl.total_interruption_duration ?? 'N/A'} |
        </li>
      {/each}
    </ul>
  {/if}
</div>
