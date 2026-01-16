<script>
	export let movementData = null;
	export let workoutData = null;
	export let sleepData = null;

	// counts (safe)
	$: stepFishCount =
		(movementData?.totalSteps ?? 0) >= 55000 ? 3 :
		(movementData?.totalSteps ?? 0) >= 25000 ? 2 :
		(movementData?.totalSteps ?? 0) >= 10000 ? 1 : 0;

	$: workoutCount =
		(workoutData?.plumes?. notedVisibleCount ?? 0);

	// compute workouts (visible plumes)
	$: workoutsThisWeek =
		workoutData?.plumes?.filter(p => p.visible).length ?? 0;

	$: workoutFishCount =
		workoutsThisWeek >= 3 ? 2 :
		workoutsThisWeek >= 1 ? 1 : 0;

	// sleep fish
	function hasEnoughSleep(duration) {
		if (!duration || typeof duration !== 'string') return false;
		const match = duration.match(/(\d+)h/);
		return match ? Number(match[1]) >= 7 : false;
	}
	$: sleepFishVisible = hasEnoughSleep(sleepData?.sleepDuration);

	// turtle
	$: turtleVisible =
		stepFishCount === 3 && workoutFishCount === 2 && sleepFishVisible;
</script>

<div class="sea-life-overlay">
	<p class="intro">
		Your reef grows based on the healthy choices you make every day.
		Each habit you build brings new sea life into your reef.
	</p>

	<!-- Step Fish -->
	<div class="fish-row">
		<img class="fish-icon" src="/fish/fish-steps.png" alt="" />
		<div class="fish-content">
			<div class="fish-title">Step Fish</div>
			<div class="fish-progress">{stepFishCount}/3</div>
			<p class="fish-text">
				The Steps Fish keep track of how many steps you take during the week.
				The more you walk, the more Steps Fish you earn.
			</p>
		</div>
	</div>

	<!-- Strength Fish -->
	<div class="fish-row">
		<img class="fish-icon" src="/fish/fish-workout.png" alt="" />
		<div class="fish-content">
			<div class="fish-title">Strength Fish</div>
			<div class="fish-progress">{workoutFishCount}/2</div>
			<p class="fish-text">
				The Strength Fish show if you’ve been working out during the week.
				Each workout helps you build healthy habits, and healthy habits create a new strength fish.
			</p>
		</div>
	</div>

	<!-- Sleep Fish -->
	<div class="fish-row">
		<img class="fish-icon" src="/fish/fish-sleep.png" alt="" />
		<div class="fish-content">
			<div class="fish-title">Sleep Fish</div>
			<div class="fish-progress">{sleepFishVisible ? '1/1' : '0/1'}</div>
			<p class="fish-text">
				The Sleep fish reflects if you’ve had enough rest last night.
			</p>
		</div>
	</div>

	<!-- Turtle -->
	<div class="fish-row">
		<img class="fish-icon turtle" src="/fish/turtle.png" alt="" />
		<div class="fish-content">
			<div class="fish-title">Turtle</div>
			<div class="fish-progress">{turtleVisible ? '1/1' : '0/1'}</div>
			<p class="fish-text">
				The Turtle appears when you combine movement, workouts, and sleep.
				It represents balance and shows that you’re taking care of your body as a whole.
			</p>
		</div>
	</div>

	<p class="outro">
		Keep up the good work and help your reef grow even more beautiful!
	</p>
</div>

<style>
	.sea-life-overlay {
		width: min(90vw, 380px);
		margin: 0 auto;
		padding: 0.5rem 1.25rem 2rem;

		color: white;
		font-weight: 300;
		line-height: 1.5;

		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
	}

	.intro,
	.outro {
		font-size: 0.95rem;
		opacity: 0.95;
		margin-bottom: 1.25rem;
	}

	.fish-row {
		display: grid;
		grid-template-columns: 56px 1fr;
		gap: 0.9rem;

		align-items: start;
		margin-bottom: 1.3rem;
	}

	.fish-icon {
		width: 52px;
		height: auto;
		object-fit: contain;
		filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25));
	}

	.fish-icon.turtle {
		width: 56px;
	}

	.fish-content {
		position: relative;
	}

	.fish-title {
		font-size: 1.05rem;
		font-weight: 600;
		margin-bottom: 0.2rem;
	}

	.fish-progress {
		position: absolute;
		left: -2.7rem;
		top: 1.9rem;
		font-size: 0.9rem;
		opacity: 0.85;
	}

	.fish-text {
		margin: 0;
		font-size: 0.9rem;
		opacity: 0.85;
	}
</style>
