<script>
  import { onMount } from 'svelte';
  let exercise = null;
  let error = null;
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch('/api/activity');
      const json = await res.json();
      if (json.error) error = json.error;
      else if (json.message) exercise = null;
      else exercise = json;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });
</script>

<div>
  <h2>Latest Exercise</h2>
  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if !exercise}
    <p>No exercises available</p>
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
