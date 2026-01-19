<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	const monthName = new Date().toLocaleString('en-US', { month: 'long' });

	let selectedWeek = 1;
	let loading = true;
	let error = '';

	// will hold:
	// {
	//   1: { movement, sleep, workout, range... },
	//   2: { ... },
	//   3: { ... },
	//   4: { ... }
	// }
	let weeksData = {};

	async function loadAllWeeks() {
		loading = true;
		error = '';

		try {
			const results = await Promise.all(
				[1, 2, 3, 4].map(async (week) => {
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

	onMount(() => {
		loadAllWeeks();
	});

	/* ----------------------------
	   Map API output -> Coral png
	----------------------------- */

	const MOVEMENT_STATES = 14;
	const SLEEP_STATES = 14;

	function movementStateFromGrowth(growth) {
		const g = growth ?? 0;
		return Math.min(MOVEMENT_STATES - 1, Math.floor(g * MOVEMENT_STATES));
	}

	function sleepStateFromGrowth(growth) {
		const g = growth ?? 0;
		return Math.min(SLEEP_STATES - 1, Math.floor(g * SLEEP_STATES));
	}

	function movementSrc(week) {
		const w = weeksData[week];
		const state = movementStateFromGrowth(w?.movement?.growth ?? 0);
		return `/coralMovement/movement-${state}.png`;
	}

	function sleepSrc(week) {
		const w = weeksData[week];
		const state = sleepStateFromGrowth(w?.sleep?.growth ?? 0);
		return `/coralSleep/sleep-${state}.png`;
	}
</script>

<div class="history-page">
	<!-- Header -->
	<div class="history-header">
		<button class="history-back" on:click={() => goto('/dashboard')} aria-label="Back"> ← </button>

		<h1 class="history-title">History - {monthName}</h1>
	</div>

	<p class="history-subtitle">
		This month, your reef grew stronger <br />
		through your daily habits
	</p>

	{#if loading}
		<p class="history-status">Loading...</p>
	{:else if error}
		<p class="history-status history-error">{error}</p>
	{:else}
		<!-- Main Layout -->
		<div class="history-main">
			<!-- Left side: rock + corals -->
			<div class="history-rock-area">
				<img class="history-rock" src="/background/rock-history.png" alt="Rock" />

				<!-- Week 1 corals -->
				<div class="history-week-coral week-1">
					<img class="history-coral sleep week1-sleep" src={sleepSrc(1)} alt="Sleep coral week 1" />
					<img
						class="history-coral movement week1-movement"
						src={movementSrc(1)}
						alt="Movement coral week 1"
					/>

					<div class="history-workout-wrapper week1-workout-wrapper">
						<img
							class="history-coral workout week1-workout"
							src="/background/sportCoral.png"
							alt="Workout coral week 1"
						/>

						{#each weeksData[1]?.workout?.plumes ?? [] as plume, i}
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

				<!-- Week 2 corals -->
				<div class="history-week-coral week-2">
					<img class="history-coral sleep week2-sleep" src={sleepSrc(2)} alt="Sleep coral week 2" />
					<img
						class="history-coral movement week2-movement"
						src={movementSrc(2)}
						alt="Movement coral week 2"
					/>

					<div class="history-workout-wrapper week2-workout-wrapper">
						<img
							class="history-coral workout week2-workout"
							src="/background/sportCoral.png"
							alt="Workout coral week 2"
						/>

						{#each weeksData[2]?.workout?.plumes ?? [] as plume, i}
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

				<!-- Week 3 corals -->
				<div class="history-week-coral week-3">
					<img class="history-coral sleep week3-sleep" src={sleepSrc(3)} alt="Sleep coral week 3" />
					<img
						class="history-coral movement week3-movement"
						src={movementSrc(3)}
						alt="Movement coral week 3"
					/>

					<div class="history-workout-wrapper week3-workout-wrapper">
						<img
							class="history-coral workout week3-workout"
							src="/background/sportCoral.png"
							alt="Workout coral week 3"
						/>

						{#each weeksData[3]?.workout?.plumes ?? [] as plume, i}
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

				<!-- Week 4 corals -->
				<div class="history-week-coral week-4">
					<img class="history-coral sleep week4-sleep" src={sleepSrc(4)} alt="Sleep coral week 4" />
					<img
						class="history-coral movement week4-movement"
						src={movementSrc(4)}
						alt="Movement coral week 4"
					/>

					<div class="history-workout-wrapper week4-workout-wrapper">
						<img
							class="history-coral workout week4-workout"
							src="/background/sportCoral.png"
							alt="Workout coral week 4"
						/>

						{#each weeksData[4]?.workout?.plumes ?? [] as plume, i}
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
			</div>

			<!-- Right side: week buttons -->
			<div class="history-weeks">
				{#each [1, 2, 3, 4] as week}
					<button
						class="history-week-button"
						class:active-week={selectedWeek === week}
						on:click={() => (selectedWeek = week)}
					>
						Week {week}
					</button>
				{/each}
			</div>
		</div>

		<!-- Bottom dropdown -->
		<button class="history-dropdown">
			View your monthly reef ✓
			<span class="history-dropdown-sub">A recap of your habits and progress</span>
		</button>
	{/if}
</div>
