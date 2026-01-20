<script>
	import { onMount } from 'svelte';

	/* Total steps from the user (used to calculate fish count) */
	export let totalSteps = 0;

	/* Callback when user clicks the fish (opens details overlay) */
	export let onOpen = () => {};

	/* Step → Fish count  */
	$: fishCount = totalSteps >= 55000 ? 3 : totalSteps >= 25000 ? 2 : totalSteps >= 10000 ? 1 : 0;

	/* Swimming animation state */
	const OFFSCREEN_PADDING = 200;

	/* Current horizontal position of the fish school */
	let x = -OFFSCREEN_PADDING;

	/* 1 = right, -1 = left */
	let direction = 1;

	/* Swimming speed per frame */
	let speed = 0.35;

	/* Used for boundary checks */
	let screenWidth = 0;

	let frameId;

	onMount(() => {
		/* Get screen width when component mounts */
		screenWidth = window.innerWidth;

		/* Keep it responsive on resize/rotation */
		const handleResize = () => {
			screenWidth = window.innerWidth;
		};

		window.addEventListener('resize', handleResize);

		/* Main animation loop */
		const loop = () => {
			x += speed * direction;

			/* If the school leaves the right side → flip direction */
			if (direction === 1 && x > screenWidth + OFFSCREEN_PADDING) {
				direction = -1;
				x = screenWidth + OFFSCREEN_PADDING;
			}

			/* If the school leaves the left side → flip direction */
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

{#if fishCount > 0}
	<!-- Clickable fish area (class is styled globally in app.css) -->
	<button type="button" class="fish-click" aria-label="Open sea life details" on:click={onOpen}>
		<!-- Fish school container:
		     translateX = movement
		     scaleX = flip direction -->
		<div class="fish-school" style="transform: translateX({x}px) scaleX({direction});">
			{#each Array(fishCount) as _, i}
				<!--
					Each fish gets custom CSS variables:
					--offset-x = spacing between fish
					--offset-y = vertical variation
					--delay    = animation delay for natural movement
				-->
				<img
					class="fish"
					src="/fish/fish-steps.png"
					alt=""
					style="
						--offset-x: {i * 24}px;
						--offset-y: {i === 1 ? -10 : i === 2 ? 8 : 0}px;
						--delay: {i * 0.15}s;
					"
				/>
			{/each}
		</div>
	</button>
{/if}
