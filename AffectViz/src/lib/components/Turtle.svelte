<script>
	import { onMount } from 'svelte';

	export let movementData = null;
	export let workoutData = null;
	export let sleepData = null;

	/* Callback when turtle is clicked (opens sea-life details) */
	export let onOpen = () => {};

	/* Steps requirement: 55,000+ steps (max step fish = 3/3) */
	$: stepsReady = (movementData?.totalSteps ?? 0) >= 55000;

	/* Workout requirement: at least 3 visible workout plumes */
	$: workoutsThisWeek = workoutData?.plumes?.filter((p) => p.visible).length ?? 0;
	$: workoutReady = workoutsThisWeek >= 3;

	/* Sleep requirement: at least 7 hours last night */
	function hasEnoughSleep(duration) {
		if (!duration || typeof duration !== 'string') return false;
		const match = duration.match(/(\d+)h/);
		return match ? Number(match[1]) >= 7 : false;
	}

	$: sleepReady = hasEnoughSleep(sleepData?.sleepDuration);

	/* Turtle appears only when all requirements are met */
	$: visible = stepsReady && workoutReady && sleepReady;

	/* Movement animation (requestAnimationFrame) */
	const OFFSCREEN_PADDING = 220;

	/* Horizontal position */
	let x = -OFFSCREEN_PADDING;

	/* 1 = swim right, -1 = swim left */
	let direction = 1;

	/* Turtle moves slower than fish */
	let speed = 0.18;

	/* Screen width used for wrapping logic */
	let screenWidth = 0;

	/* Used for gentle floating motion (sin wave) */
	let t = 0;

	let frameId;

	onMount(() => {
		screenWidth = window.innerWidth;

		/* Keep width correct when resizing/rotating */
		const handleResize = () => {
			screenWidth = window.innerWidth;
		};

		window.addEventListener('resize', handleResize);

		const loop = () => {
			/*
				Only animate when the turtle is visible.
				This saves a tiny bit of performance when invisible.
			*/
			if (visible) {
				x += speed * direction;
				t += 0.01;

				/* Exit right side → flip to left */
				if (direction === 1 && x > screenWidth + OFFSCREEN_PADDING) {
					direction = -1;
					x = screenWidth + OFFSCREEN_PADDING;
				}

				/* Exit left side → flip to right */
				if (direction === -1 && x < -OFFSCREEN_PADDING) {
					direction = 1;
					x = -OFFSCREEN_PADDING;
				}
			}

			frameId = requestAnimationFrame(loop);
		};

		loop();

		/* Cleanup */
		return () => {
			window.removeEventListener('resize', handleResize);
			cancelAnimationFrame(frameId);
		};
	});
</script>

{#if visible}
	<!--
		The turtle is clickable via this full button.
		The turtle container has pointer-events: none,
		so the button handles the click.
	-->
	<button type="button" class="fish-click" aria-label="Open sea life details" on:click={onOpen}>
		<!--
			turtle class is styled globally in app.css.
			transform:
			- translateX(x) = swim movement
			- scaleX(direction) = horizontal flip
		-->
		<div class="turtle" style="transform: translateX({x}px) scaleX({direction});">
			<!--
				Gentle floating effect through CSS variable:
				--float is used in app.css for translateY()
			-->
			<img class="turtle-img" src="/fish/turtle.png" alt="" style="--float: {Math.sin(t) * 4}px;" />
		</div>
	</button>
{/if}
