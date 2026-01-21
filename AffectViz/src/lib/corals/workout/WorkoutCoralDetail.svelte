<script>
	import { workoutConfig } from './workout.config';
	import { scoreTier } from '$lib/utils/scoreTier';

	export let data;

	/* Score tier (controls which explanation text is shown) */
	let tier = 'low';

	/*
		data.growth is expected between 0 and 1.
		We convert to percentage for scoreTier().
	*/
	$: if (data?.growth != null) {
		tier = scoreTier(data.growth * 100);
	}
</script>

<!-- Workout overlay screen -->
<section class="workout-overlay">
	<!-- Main scrollable overlay content -->
	<main class="workout-info-scroll">
		<!-- Tier-based explanation text -->
		<section class="workout-text">
			{#each workoutConfig.tiers[tier].text as paragraph}
				<p>{paragraph}</p>
			{/each}
		</section>

		<!-- Stats block (styled like a card via CSS) -->
		<section class="workout-stats workout-stats-3row">
			<!-- Top row: calories + time -->
			<div class="workout-stats-top">
				<div>
					<strong>Cal burned</strong>
					<span>{data?.workoutCalories ?? 0}</span>
				</div>

				<!-- Divider (CSS already styles .divider) -->
				<div class="divider"></div>

				<div>
					<strong>Time</strong>
					<span>{data?.workoutDurationMinutes ?? 0} min</span>
				</div>
			</div>

			<!-- Bottom row: average heart rate -->
			<div class="workout-stats-bottom">
				<hr class="workout-divider" />

				<div>
					<strong>AVG heart rate</strong>
					<span>{data?.avgHeartRate ?? '–'}</span>
				</div>
			</div>
		</section>
	</main>

	<!-- Decorative coral image -->
	<img src="/background/sportCoral.png" alt="" class="workout-overlay-coral" />

	<!-- Screen title (positioned via CSS) -->
	<h1 class="workout-overlay-title">{workoutConfig.title}</h1>
</section>
