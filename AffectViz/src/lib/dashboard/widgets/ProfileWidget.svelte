<script>
  import { onMount } from 'svelte';

  let profile = null;
  let error = null;
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch('/api/profile', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();

      if (data.error) {
        error = data.error;
        profile = null;
      } else if (data.message) {
        profile = null; // No profile data
      } else {
        profile = data;
      }
    } catch (err) {
      error = err.message;
      profile = null;
    } finally {
      loading = false;
    }
  });
</script>

<div>
  <h2>User Profile</h2>

  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if !profile}
    <p>No profile data available</p>
  {:else}
    <ul>
      <li>Polar User ID: {profile['polar-user-id']}</li>
      <li>Member ID: {profile['member-id']}</li>
      <li>Name: {profile['first-name']} {profile['last-name']}</li>
      <li>Birthdate: {profile['birthdate']}</li>
      <li>Gender: {profile['gender']}</li>
      <li>Weight: {profile['weight']} kg</li>
      <li>Height: {profile['height']} cm</li>
      {#if profile['extra-info'] && profile['extra-info'].length > 0}
        {#each profile['extra-info'] as info}
          <li>{info.name}: {info.value}</li>
        {/each}
      {/if}
    </ul>
  {/if}
</div>
