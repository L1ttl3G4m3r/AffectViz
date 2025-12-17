<script>
  import { onMount } from 'svelte';
  let recharge = null;
  let error = null;

  onMount(async () => {
    try {
      const res = await fetch('/api/nightly-recharge');
      if (!res.ok) throw new Error('Failed to fetch nightly recharge');
      recharge = await res.json();
    } catch (err) {
      error = err.message;
    }
  });
</script>

<div>
  <h2>Nightly Recharge</h2>
  {#if error}
    <p class="error">{error}</p>
  {:else if !recharge}
    <p>Loading...</p>
  {:else}
    <ul>
      {#each recharge as night}
        <li>{new Date(night.date).toLocaleDateString()}: Score {night.score}</li>
      {/each}
    </ul>
  {/if}
</div>
