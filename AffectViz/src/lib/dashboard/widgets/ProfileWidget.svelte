<script>
  import { onMount } from 'svelte';
  let profile = null;
  let error = null;

  onMount(async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      profile = await res.json();
    } catch (err) {
      error = err.message;
    }
  });
</script>

<div>
  <h2>Profile</h2>
  {#if error}
    <p class="error">{error}</p>
  {:else if !profile}
    <p>Loading...</p>
  {:else}
    <ul>
      <li>Height: {profile.height} cm</li>
      <li>Weight: {profile.weight} kg</li>
      <li>Resting HR: {profile.restingHeartRate}</li>
      <li>Max HR: {profile.maximumHeartRate}</li>
      <li>VO₂max: {profile.vo2Max ?? 'N/A'}</li>
    </ul>
  {/if}
</div>
