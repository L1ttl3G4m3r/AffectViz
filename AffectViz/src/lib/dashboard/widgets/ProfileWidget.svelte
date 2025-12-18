<script>
  import { onMount } from 'svelte';
  let profile = null;
  let error = null;
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch('/api/profile');
      const json = await res.json();
      if (json.error) error = json.error;
      else if (json.message) profile = null;
      else profile = json;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });
</script>

<div>
  <h2>Profile</h2>
  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if !profile}
    <p>No profile data</p>
  {:else}
    <ul>
      <li>Name: {profile.name}</li>
      <li>Email: {profile.email}</li>
    </ul>
  {/if}
</div>
