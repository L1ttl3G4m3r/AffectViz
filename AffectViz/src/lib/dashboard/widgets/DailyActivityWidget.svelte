<script>
  import { onMount } from 'svelte';
  let dailyActivity = null;
  let error = null;

  onMount(async () => {
    try {
      const res = await fetch('/api/daily-activity');
      if (!res.ok) throw new Error('Failed to fetch daily activity');
      dailyActivity = await res.json();
    } catch (err) {
      error = err.message;
    }
  });
</script>

<div>
  <h2>Daily Activity</h2>
  {#if error}
    <p class="error">{error}</p>
  {:else if !dailyActivity}
    <p>Loading...</p>
  {:else}
    <ul>
      {#each dailyActivity as day}
        <li>{day.date}: {day.steps} steps, {day.calories} cal</li>
      {/each}
    </ul>
  {/if}
</div>
