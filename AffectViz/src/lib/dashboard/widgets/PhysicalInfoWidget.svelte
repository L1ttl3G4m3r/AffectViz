<script>
  import { onMount } from 'svelte';
  let info = null;
  let error = null;

  onMount(async () => {
    try {
      const res = await fetch('/api/physical-info');
      if (!res.ok) throw new Error('Failed to fetch physical info');
      info = await res.json();
    } catch (err) {
      error = err.message;
    }
  });
</script>

<div>
  <h2>Physical Info</h2>
  {#if error}
    <p class="error">{error}</p>
  {:else if !info}
    <p>Loading...</p>
  {:else}
    <ul>
      {#each info as item}
        <li>{item.timestamp}: {item.height} cm, {item.weight} kg</li>
      {/each}
    </ul>
  {/if}
</div>
