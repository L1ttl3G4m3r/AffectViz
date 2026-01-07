<script>
  import { onMount } from 'svelte';

  let exercises = [];
  let error = null;
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch('/api/activity', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch exercises');
      const data = await res.json();

      if (data.error) {
        error = data.error;
        exercises = [];
      } else {
        exercises = data;
      }
    } catch (err) {
      error = err.message;
      exercises = [];
    } finally {
      loading = false;
    }
  });
</script>

<div>
  <h2>Exercises</h2>

  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if !exercises.length}
    <p>No exercises available</p>
  {:else}
    <ul>
      {#each exercises as ex}
        <li>
          <strong>ID:</strong> {ex.id} |
          <strong>Sport:</strong> {ex.sport ?? 'N/A'} |
          <strong>Details:</strong> {ex.detailed_sport_info ?? 'N/A'} |
          <strong>Duration:</strong> {ex.duration ?? 'N/A'} |
          <strong>Calories:</strong> {ex.calories ?? 'N/A'} |
          <strong>Distance:</strong> {ex.distance ?? 'N/A'} |
          <strong>Heart Rate:</strong>
            {#if ex.heart_rate}
              Avg {ex.heart_rate.average ?? 'N/A'}, Max {ex.heart_rate.maximum ?? 'N/A'}
            {:else}
              N/A
            {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>
