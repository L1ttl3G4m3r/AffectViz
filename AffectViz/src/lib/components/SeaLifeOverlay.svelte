<script>
	export let movementData = null;
	export let workoutData = null;
	export let sleepData = null;

	/* Step fish based on total steps */
	$: totalSteps = movementData?.totalSteps ?? 0;

	/*
		Step fish levels:
		- 10k+  -> 1 fish
		- 25k+  -> 2 fish
		- 55k+  -> 3 fish
	*/
	$: stepFishCount =
		totalSteps >= 55000 ? 3 : totalSteps >= 25000 ? 2 : totalSteps >= 10000 ? 1 : 0;

	/*
		A plume represents a workout.
		We only count plumes marked as visible.
	*/
	$: workoutsThisWeek = workoutData?.plumes?.filter((p) => p.visible).length ?? 0;

	/*
		Workout fish levels:
		- 1+ workouts  -> 1 fish
		- 3+ workouts  -> 2 fish
	*/
	$: workoutFishCount = workoutsThisWeek >= 3 ? 2 : workoutsThisWeek >= 1 ? 1 : 0;

	/* Sleep fish appears if user slept at least 7 hours last night. */
	function hasEnoughSleep(duration) {
		if (!duration || typeof duration !== 'string') return false;

		const match = duration.match(/(\d+)h/);
		if (!match) return false;

		return Number(match[1]) >= 7;
	}

	$: sleepFishVisible = hasEnoughSleep(sleepData?.sleepDuration);

	/*
		Turtle appears only if:
		- max step fish (3/3)
		- max workout fish (2/2)
		- sleep fish visible (1/1)
	*/
	$: turtleVisible = stepFishCount === 3 && workoutFishCount === 2 && sleepFishVisible;

	/* Helpers for display text */
	$: sleepProgressText = sleepFishVisible ? '1/1' : '0/1';
	$: turtleProgressText = turtleVisible ? '1/1' : '0/1';
</script>

<!--
	This content is meant to be displayed inside an overlay panel.
	The styling is global (app.css) so it can be reused anywhere.
-->
<section class="sea-life-overlay">
	<!-- Intro explanation -->
	<p class="intro">
		Your reef grows based on the healthy choices you make every day. Each habit you build brings new
		sea life into your reef.
	</p>

	<!-- ==========================================================
	     Step Fish
	     ========================================================== -->
	<article class="fish-row">
		<img class="fish-icon" src="/fish/fish-steps.png" alt="" />

		<div class="fish-content">
			<h2 class="fish-title">Step Fish</h2>
			<div class="fish-progress">{stepFishCount}/3</div>

			<p class="fish-text">
				The Steps Fish keep track of how many steps you take during the week. The more you walk, the
				more Steps Fish you earn.
			</p>
		</div>
	</article>

	<!-- ==========================================================
	     Strength Fish (Workout)
	     ========================================================== -->
	<article class="fish-row">
		<img class="fish-icon" src="/fish/fish-workout.png" alt="" />

		<div class="fish-content">
			<h2 class="fish-title">Strength Fish</h2>
			<div class="fish-progress">{workoutFishCount}/2</div>

			<p class="fish-text">
				The Strength Fish show if you’ve been working out during the week. Each workout helps you
				build healthy habits, and healthy habits create a new strength fish.
			</p>
		</div>
	</article>

	<!-- ==========================================================
	     Sleep Fish
	     ========================================================== -->
	<article class="fish-row">
		<img class="fish-icon" src="/fish/fish-sleep.png" alt="" />

		<div class="fish-content">
			<h2 class="fish-title">Sleep Fish</h2>
			<div class="fish-progress">{sleepProgressText}</div>

			<p class="fish-text">The Sleep fish reflects if you’ve had enough rest last night.</p>
		</div>
	</article>

	<!-- ==========================================================
	     Turtle (bonus reward)
	     ========================================================== -->
	<article class="fish-row">
		<img class="fish-icon" src="/fish/turtle.png" alt="" />

		<div class="fish-content">
			<h2 class="fish-title">Turtle</h2>
			<div class="fish-progress">{turtleProgressText}</div>

			<p class="fish-text">
				The Turtle appears when you combine movement, workouts, and sleep. It represents balance and
				shows that you’re taking care of your body as a whole.
			</p>
		</div>
	</article>

	<!-- Outro message -->
	<p class="outro">Keep up the good work and help your reef grow even more beautiful!</p>
</section>
