<script>
  import { onMount } from 'svelte';

  let activity = [];
  let error = null;
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch('/api/daily-activity', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch activities');
      const data = await res.json();

      if (data.error) {
        error = data.error;
        activity = [];
      } else {
        activity = data;
      }
    } catch (err) {
      error = err.message;
      activity = [];
    } finally {
      loading = false;
    }
  });
</script>

<div>
  <h2>Activities</h2>

  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if !activity.length}
    <p>No activities available</p>
  {:else}
    <ul>
      {#each activity as ac}
        <li>
          <strong>Start Time:</strong> {ac.start_time ?? 'N/A'} |
          <strong>End Time:</strong> {ac.end_time ?? 'N/A'} |
          <strong>Calories:</strong> {ac.calories ?? 'N/A'} |
          <strong>Steps:</strong> {ac.steps ?? 'N/A'} |
          <strong>Distance:</strong> {ac.distance_from_steps ?? 'N/A'} |
        </li>
      {/each}
    </ul>
  {/if}
</div>
