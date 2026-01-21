<script>
	import { onMount } from 'svelte';

	/* Sleep data (contains sleepDuration string like "7h 30m") */
	export let sleepData = null;

	/* Callback when user taps/clicks the sleep fish */
	export let onOpen = () => {};

	/* Show the sleep fish only if the user slept at least 7 hours. */
	function hasEnoughSleep(duration) {
		if (!duration || typeof duration !== 'string') return false;

		/* Extract number before "h" */
		const match = duration.match(/(\d+)h/);
		if (!match) return false;

		const hours = Number(match[1]);
		return hours >= 7;
	}

	/* Reactive flag: should the fish appear? */
	$: showFish = hasEnoughSleep(sleepData?.sleepDuration);

	/* Swimming animation state */
	const OFFSCREEN_PADDING = 160;

	/* Horizontal position of the sleep fish */
	let x = -OFFSCREEN_PADDING;

	/* 1 = right, -1 = left */
	let direction = 1;

	/* Slower speed = calmer swim vibe */
	let speed = 0.25;

	/* Used for boundary checks */
	let screenWidth = 0;

	/* Used for gentle vertical floating (sin wave) */
	let t = 0;

	let frameId;

	onMount(() => {
		screenWidth = window.innerWidth;

		/* Keep screenWidth correct on resize/rotation */
		const handleResize = () => {
			screenWidth = window.innerWidth;
		};

		window.addEventListener('resize', handleResize);

		/* requestAnimationFrame movement loop */
		const loop = () => {
			x += speed * direction;
			t += 0.015;

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

			frameId = requestAnimationFrame(loop);
		};

		loop();

		/* Cleanup on destroy */
		return () => {
			window.removeEventListener('resize', handleResize);
			cancelAnimationFrame(frameId);
		};
	});
</script>

{#if showFish}
	<!--
		This button makes the fish clickable.
		The fish container itself has pointer-events: none,
		so the click is handled by the button.
	-->
	<button type="button" class="fish-click" aria-label="Open sea life details" on:click={onOpen}>
		<!--
			fish-sleep is styled globally in app.css:
			- placed high in the scene
			- calmer animation vibe

			transform:
			- translateX(x) = horizontal movement
			- scaleX(direction) = flip based on direction
		-->
		<div class="fish-sleep" style="transform: translateX({x}px) scaleX({direction});">
			<!--
				Single sleep fish:
				--offset-y adds gentle floating motion using sin(t)
			-->
			<img
				class="fish"
				src="/fish/fish-sleep.png"
				alt=""
				style="--offset-y: {Math.sin(t) * 2}px;"
			/>
		</div>
	</button>
{/if}
