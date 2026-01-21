<script>
	import { onMount } from 'svelte';

	/* Workout data (contains plumes with visibility state) */
	export let workoutData = null;

	/* Callback when user taps/clicks the fish */
	export let onOpen = () => {};

	/*
		We count how many workout "plumes" are visible.
		That represents workouts completed this week.
	*/
	$: workoutsThisWeek = workoutData?.plumes?.filter((p) => p.visible).length ?? 0;

	/*
		Visual feedback:
		- 0 workouts -> 0 fish
		- 1+ workouts -> 1 fish
		- 3+ workouts -> 2 fish
	*/
	$: fishCount = workoutsThisWeek >= 3 ? 2 : workoutsThisWeek >= 1 ? 1 : 0;

	/* Swimming animation state */
	const OFFSCREEN_PADDING = 200;

	/* Horizontal position of the fish school */
	let x = -OFFSCREEN_PADDING;

	/* 1 = swim right, -1 = swim left */
	let direction = 1;

	/* Speed per frame */
	let speed = 0.4;

	/* Screen width for boundary detection */
	let screenWidth = 0;

	/*
		Time variable used for subtle vertical bobbing (sin wave).
		This makes workout fish feel more "alive" than step fish.
	*/
	let t = 0;

	let frameId;

	onMount(() => {
		screenWidth = window.innerWidth;

		/* Keeps movement correct when rotating / resizing */
		const handleResize = () => {
			screenWidth = window.innerWidth;
		};

		window.addEventListener('resize', handleResize);

		/* requestAnimationFrame loop */
		const loop = () => {
			x += speed * direction;
			t += 0.02;

			/* Leave screen on right → flip direction */
			if (direction === 1 && x > screenWidth + OFFSCREEN_PADDING) {
				direction = -1;
				x = screenWidth + OFFSCREEN_PADDING;
			}

			/* Leave screen on left → flip direction */
			if (direction === -1 && x < -OFFSCREEN_PADDING) {
				direction = 1;
				x = -OFFSCREEN_PADDING;
			}

			frameId = requestAnimationFrame(loop);
		};

		loop();

		/* Cleanup on unmount */
		return () => {
			window.removeEventListener('resize', handleResize);
			cancelAnimationFrame(frameId);
		};
	});
</script>

{#if fishCount > 0}
	<!--
		This button makes the fish area clickable.
		The fish themselves have pointer-events: none,
		so the click is always handled by the button.
	-->
	<button type="button" class="fish-click" aria-label="Open sea life details" on:click={onOpen}>
		<!--
			Classes:
			- fish-school = base fish movement styles (app.css)
			- workout     = workout-specific overrides (app.css)

			Style:
			- translateX(x) = move across screen
			- scaleX(direction) = flip based on direction
		-->
		<div class="fish-school workout" style="transform: translateX({x}px) scaleX({direction});">
			{#each Array(fishCount) as _, i}
				<!--
					Workout fish offsets:
					--offset-x = spacing
					--offset-y = slight bobbing using sin(t + i)
				-->
				<img
					class="fish"
					src="/fish/fish-workout.png"
					alt=""
					style="
						--offset-x: {i * 26}px;
						--offset-y: {(i === 1 ? -8 : 0) + Math.sin(t + i) * 1.5}px;
					"
				/>
			{/each}
		</div>
	</button>
{/if}
