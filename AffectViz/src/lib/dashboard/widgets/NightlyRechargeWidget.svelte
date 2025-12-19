<script>
  import { onMount } from 'svelte';

  let nightlyRecharge = [];
  let error = null;
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch('/api/nightly-recharge', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch nightly recharge data');
      const data = await res.json();

      if (data.error) {
        error = data.error;
        nightlyRecharge = [];
      } else {
        nightlyRecharge = data;
      }
    } catch (err) {
      error = err.message;
      nightlyRecharge = [];
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
  {:else if !nightlyRecharge.length}
    <p>No nightly recharge data available</p>
  {:else}
    <ul>
      {#each nightlyRecharge as nr}
        <li>
          <strong>Date:</strong> {nr.date ?? 'N/A'} |
          <strong>Heart rate avg.:</strong> {nr.heart_rate_avg ?? 'N/A'} |
          <strong>Breathing rate avg.:</strong> {nr.breathing_rate_avg ?? 'N/A'} |
          <strong>Nightly recharge status:</strong> {nr.nightly_recharge_status ?? 'N/A'} |
        </li>
      {/each}
    </ul>
  {/if}
</div>
