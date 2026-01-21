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

	/* "1985-09-06" → "06-09-1985" */
	function formatBirthdate(dateStr) {
		if (!dateStr) return '-';

		const [yyyy, mm, dd] = dateStr.split('-');
		return `${dd}-${mm}-${yyyy}`;
	}

	/* "MALE" → "Male" */
	function prettyGender(g) {
		if (!g) return '-';
		return g.charAt(0) + g.slice(1).toLowerCase();
	}

	function logout() {
		goto('/logout');
	}
</script>

<!-- Settings page wrapper -->
<main class="settings-page">
	<!-- Page header -->
	<header class="settings-header">
		<button
			type="button"
			class="settings-back-button"
			on:click={() => goto('/dashboard')}
			aria-label="Back"
		>
			←
		</button>

		<h1 class="settings-title">
			{#if user}
				{user['first-name']} {user['last-name']}
			{:else}
				Settings
			{/if}
		</h1>
	</header>

	<!-- Loading / error / content states -->
	{#if loading}
		<p class="settings-status">Loading...</p>
	{:else if error}
		<p class="settings-status settings-error">{error}</p>
	{:else}
		<!-- User info card -->
		<section class="settings-card" aria-label="Personal information">
			<h2 class="settings-card-title">Personal information</h2>

			<!--
				Definition list is semantic for "Label → Value" rows.
				Classes stay identical, so your CSS keeps working.
			-->
			<dl>
				<div class="settings-row">
					<dt class="settings-label">Birthdate</dt>
					<dd class="settings-value">{formatBirthdate(user.birthdate)}</dd>
				</div>

				<div class="settings-row">
					<dt class="settings-label">Gender</dt>
					<dd class="settings-value">{prettyGender(user.gender)}</dd>
				</div>

				<div class="settings-row">
					<dt class="settings-label">Weight</dt>
					<dd class="settings-value">
						{user.weight ? `${user.weight} kg` : '-'}
					</dd>
				</div>

				<div class="settings-row">
					<dt class="settings-label">Height</dt>
					<dd class="settings-value">
						{user.height ? `${user.height} cm` : '-'}
					</dd>
				</div>
			</dl>
		</section>

		<!-- Logout button -->
		<button type="button" class="settings-logout" on:click={logout}> Log out → </button>
	{/if}
</main>
