<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import MonthlyReefOverlay from '$lib/components/MonthlyReefOverlay.svelte';

	const monthName = new Date().toLocaleString('en-US', { month: 'long' });

	let showMonthlyOverlay = false;
	let selectedWeek = 1;

	let loading = true;
	let error = '';

	/*
		weeksData shape:
		{
			1: { movement, sleep, workout, range... },
			2: { movement, sleep, workout, range... },
			3: { movement, sleep, workout, range... },
			4: { movement, sleep, workout, range... }
		}
	*/
	let weeksData = {};

	const WEEKS = [1, 2, 3, 4];

	/* DATA LOADING */
	async function loadAllWeeks() {
		loading = true;
		error = '';

		try {
			const results = await Promise.all(
				WEEKS.map(async (week) => {
					const res = await fetch(`/api/history?week=${week}`);

					if (!res.ok) {
						const e = await res.json().catch(() => ({}));
						throw new Error(e.error || `Failed to load history data (week ${week})`);
					}

					return [week, await res.json()];
				})
			);

			weeksData = Object.fromEntries(results);
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	onMount(loadAllWeeks);

	/* HELPERS: Map growth → coral image state */
	const MOVEMENT_STATES = 14;
	const SLEEP_STATES = 14;

	function stateFromGrowth(growth, maxStates) {
		const g = growth ?? 0;
		return Math.min(maxStates - 1, Math.floor(g * maxStates));
	}

	function movementSrc(week) {
		const growth = weeksData[week]?.movement?.growth ?? 0;
		const state = stateFromGrowth(growth, MOVEMENT_STATES);
		return `/coralMovement/movement-${state}.png`;
	}

	function sleepSrc(week) {
		const growth = weeksData[week]?.sleep?.growth ?? 0;
		const state = stateFromGrowth(growth, SLEEP_STATES);
		return `/coralSleep/sleep-${state}.png`;
	}

	function plumesForWeek(week) {
		return weeksData[week]?.workout?.plumes ?? [];
	}
</script>

<!-- History page wrapper -->
<main class="history-page">
	<!-- Page header -->
	<header class="history-header">
		<button
			type="button"
			class="history-back"
			on:click={() => goto('/dashboard')}
			aria-label="Back"
		>
			←
		</button>

		<h1 class="history-title">History - {monthName}</h1>
	</header>

	<p class="history-subtitle">
		This month, your reef grew stronger <br />
		through your daily habits
	</p>

	<!-- Loading + error states -->
	{#if loading}
		<p class="history-status">Loading...</p>
	{:else if error}
		<p class="history-status history-error">{error}</p>
	{:else}
		<!-- Main layout: rock (left) + week buttons (right) -->
		<section class="history-main">
			<!-- Rock + coral scene -->
			<section class="history-rock-area" aria-label="Weekly reef growth scene">
				<img class="history-rock" src="/background/rock-history.png" alt="Rock" />

				<!-- Render each week corals (week-1 .. week-4 classes are used for positioning) -->
				{#each WEEKS as week}
					<div class={`history-week-coral week-${week}`}>
						<!-- Sleep + movement corals -->
						<img
							class={`history-coral sleep week${week}-sleep`}
							src={sleepSrc(week)}
							alt={`Sleep coral week ${week}`}
						/>

						<img
							class={`history-coral movement week${week}-movement`}
							src={movementSrc(week)}
							alt={`Movement coral week ${week}`}
						/>

						<!-- Workout coral + plumes -->
						<div class={`history-workout-wrapper week${week}-workout-wrapper`}>
							<img
								class={`history-coral workout week${week}-workout`}
								src="/background/sportCoral.png"
								alt={`Workout coral week ${week}`}
							/>

							{#each plumesForWeek(week) as plume, i}
								{#if plume.visible}
									<img
										src={`/coralWorkout/plume-${i}.png`}
										alt=""
										class={`workout-plume plume-${i}`}
									/>
								{/if}
							{/each}
						</div>
					</div>
				{/each}
			</section>

			<!-- Week selector buttons -->
			<aside class="history-weeks" aria-label="Select week">
				{#each WEEKS as week}
					<button
						type="button"
						class="history-week-button"
						class:active-week={selectedWeek === week}
						on:click={() => (selectedWeek = week)}
					>
						Week {week}
					</button>
				{/each}
			</aside>
		</section>

		<!-- Bottom dropdown to open monthly recap -->
		<button type="button" class="history-dropdown" on:click={() => (showMonthlyOverlay = true)}>
			View your monthly reef
			<span class="history-dropdown-sub">A recap of your habits and progress</span>
		</button>
	{/if}
</main>

<!-- Monthly overlay (always mounted, controlled by open prop) -->
<MonthlyReefOverlay
	open={showMonthlyOverlay}
	{monthName}
	onClose={() => (showMonthlyOverlay = false)}
/>
