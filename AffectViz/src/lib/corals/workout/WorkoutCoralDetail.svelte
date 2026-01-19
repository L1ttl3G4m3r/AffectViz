<script>
	import { workoutConfig } from './workout.config';
	import { scoreTier } from '$lib/utils/scoreTier';

	export let data;

	let tier = 'low';

	$: if (data?.growth != null) {
		tier = scoreTier(data.growth * 100);
	}
</script>

<section class="workout-overlay">
	<div class="workout-info-scroll">
		<div class="workout-text">
			{#each workoutConfig.tiers[tier].text as paragraph}
				<p>{paragraph}</p>
			{/each}
		</div>

		<!-- ✅ Updated stats card -->
		<div class="workout-stats workout-stats-3row">
			<div class="workout-stats-top">
				<div>
					<strong>Cal burned</strong>
					<span>{data?.workoutCalories ?? 0}</span>
				</div>

				<div class="divider"></div>

				<div>
					<strong>Time</strong>
					<span>{data?.workoutDurationMinutes ?? 0} min</span>
				</div>
			</div>

			<div class="workout-stats-bottom">
				<hr class="workout-divider" />

				<div>
					<strong>AVG heart rate</strong>
					<span>{data?.avgHeartRate ?? '–'}</span>
				</div>
			</div>
		</div>
	</div>

	<img
		src="/background/sportCoral.png"
		alt=""
		class="workout-overlay-coral"
	/>

	<h1 class="workout-overlay-title">
		{workoutConfig.title}
	</h1>
</section>
