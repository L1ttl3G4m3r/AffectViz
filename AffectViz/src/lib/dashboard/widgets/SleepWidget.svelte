<script>
  import { onMount } from 'svelte';
  let sleep = null;
  let error = null;

  onMount(async () => {
    try {
      const res = await fetch('/api/sleep');
      if (!res.ok) throw new Error('Failed to fetch sleep data');
      sleep = await res.json();
    } catch (err) {
      error = err.message;
    }
  });
</script>

<div>
  <h2>Sleep</h2>
  {#if error}
    <p class="error">{error}</p>
  {:else if !sleep}
    <p>Loading...</p>
  {:else}
    <ul>
      {#each sleep as session}
        <li>{new Date(session.start_time).toLocaleString()} - {session.duration / 3600} hrs</li>
      {/each}
    </ul>
  {/if}
</div>
