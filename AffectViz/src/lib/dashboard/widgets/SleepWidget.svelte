<script>
  import { onMount } from 'svelte';
  let sleep = null;
  let error = null;
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch('/api/sleep');
      const json = await res.json();
      if (json.error) error = json.error;
      else if (json.message) sleep = null;
      else sleep = json;
    } catch (err) {
      error = err.message;
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
  {:else if !sleep}
    <p>No sleep data available</p>
  {:else}
    <ul>
      <li>Start: {new Date(sleep.start_time).toLocaleString()}</li>
      <li>End: {new Date(sleep.end_time).toLocaleString()}</li>
      <li>Duration: {sleep.duration / 3600} hours</li>
    </ul>
  {/if}
</div>
