<script>
  import { onMount } from 'svelte';
  let recharge = null;
  let error = null;
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch('/api/nightly-recharge');
      const json = await res.json();
      if (json.error) error = json.error;
      else if (json.message) recharge = null;
      else recharge = json;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });
</script>

<div>
  <h2>Nightly Recharge</h2>
  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if !recharge}
    <p>No data available</p>
  {:else}
    <ul>
      <li>Score: {recharge.score}</li>
      <li>Status: {recharge.status}</li>
    </ul>
  {/if}
</div>
