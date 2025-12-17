<script>
  import { onMount } from 'svelte';
  let exercise = null;
  let error = null;

  onMount(async () => {
    try {
      const res = await fetch('/api/activity');
      if (!res.ok) throw new Error('Failed to fetch latest exercise');
      exercise = await res.json();
    } catch (err) {
      error = err.message;
    }
  });
</script>

<div>
  <h2>Latest Exercise</h2>
  {#if error}
    <p class="error">{error}</p>
  {:else if !exercise}
    <p>Loading...</p>
  {:else}
    <ul>
      <li>ID: {exercise.id}</li>
      <li>Type: {exercise.training_type}</li>
      <li>Date: {new Date(exercise.start_time).toLocaleString()}</li>
      <li>Duration: {exercise.duration / 60} min</li>
      <li>Calories: {exercise.calories}</li>
    </ul>
  {/if}
</div>
