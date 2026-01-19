<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let user = null;
	let loading = true;
	let error = '';

	onMount(async () => {
		try {
			const res = await fetch('/api/polar-user');

			if (!res.ok) {
				const errData = await res.json().catch(() => ({}));
				throw new Error(errData?.error || 'Failed to load Polar user info');
			}

			user = await res.json();
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	});

	function formatBirthdate(dateStr) {
		if (!dateStr) return '-';
		// "1985-09-06" -> "06-09-1985"
		const [yyyy, mm, dd] = dateStr.split('-');
		return `${dd}-${mm}-${yyyy}`;
	}

	function prettyGender(g) {
		if (!g) return '-';
		return g.charAt(0) + g.slice(1).toLowerCase();
	}

	function logout() {
		goto('/logout');
	}
</script>

<div class="settings-page">
	<!-- Header -->
	<div class="settings-header">
		<button class="settings-back-button" on:click={() => goto('/dashboard')} aria-label="Back">
			←
		</button>

		<h1 class="settings-title">
			{#if user}
				{user['first-name']} {user['last-name']}
			{:else}
				Settings
			{/if}
		</h1>
	</div>

	{#if loading}
		<p class="settings-status">Loading...</p>
	{:else if error}
		<p class="settings-status settings-error">{error}</p>
	{:else}
		<!-- Card -->
		<div class="settings-card">
			<h2 class="settings-card-title">Personal information</h2>

			<div class="settings-row">
				<span class="settings-label">Birthdate</span>
				<span class="settings-value">{formatBirthdate(user.birthdate)}</span>
			</div>

			<div class="settings-row">
				<span class="settings-label">Gender</span>
				<span class="settings-value">{prettyGender(user.gender)}</span>
			</div>

			<div class="settings-row">
				<span class="settings-label">Weight</span>
				<span class="settings-value">
					{user.weight ? `${user.weight} kg` : '-'}
				</span>
			</div>

			<div class="settings-row">
				<span class="settings-label">Height</span>
				<span class="settings-value">
					{user.height ? `${user.height} cm` : '-'}
				</span>
			</div>
		</div>

		<!-- Logout -->
		<button class="settings-logout" on:click={logout}>
			Log out →
		</button>
	{/if}
</div>
