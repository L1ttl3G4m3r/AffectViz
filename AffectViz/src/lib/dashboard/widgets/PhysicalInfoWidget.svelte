<script>
  import { onMount } from 'svelte';
  let info = null;
  let error = null;
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch('/api/physical-info');
      const json = await res.json();
      if (json.error) error = json.error;
      else if (json.message) info = null;
      else info = json;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });
</script>

<div>
  <h2>Physical Info</h2>
  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if !info}
    <p>No physical info available</p>
  {:else}
    <ul>
      <li>Weight: {info.weight} kg</li>
      <li>Height: {info.height} cm</li>
      <li>VO₂ max: {info.vo2max}</li>
    </ul>
  {/if}
</div>
