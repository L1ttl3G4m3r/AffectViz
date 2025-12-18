<script>
  import { onMount } from 'svelte';
  let activity = null;
  let error = null;
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch('/api/daily-activity');
      const json = await res.json();
      if (json.error) error = json.error;
      else if (json.message) activity = null;
      else activity = json;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });
</script>

<div>
  <h2>Daily Activity</h2>
  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if !activity}
    <p>No daily activity data</p>
  {:else}
    <ul>
      <li>Steps: {activity.steps}</li>
      <li>Calories: {activity.calories}</li>
      <li>Distance: {activity.distance / 1000} km</li>
    </ul>
  {/if}
</div>
