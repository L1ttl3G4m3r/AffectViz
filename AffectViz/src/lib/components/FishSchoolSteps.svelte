<script>
	import { onMount } from 'svelte';

	export let totalSteps = 0;

	/* STEP → FISH COUNT */
	$: fishCount =
		totalSteps >= 55000 ? 3 :
		totalSteps >= 25000 ? 2 :
		totalSteps >= 10000 ? 1 : 0;

	let x = -200;          // starting off-screen
	let direction = 1;     // 1 = right, -1 = left
	let speed = 0.35;      // swimming speed
	let screenWidth = 0;

	onMount(() => {
		screenWidth = window.innerWidth;

		const loop = () => {
			x += speed * direction;

			/* when school fully leaves screen */
			if (direction === 1 && x > screenWidth + 200) {
				direction = -1;
				x = screenWidth + 200;
			}

			if (direction === -1 && x < -200) {
				direction = 1;
				x = -200;
			}

			requestAnimationFrame(loop);
		};

		loop();
	});
</script>

{#if fishCount > 0}
	<div
		class="fish-school"
		style="
			transform:
				translateX({x}px)
				scaleX({direction});
		"
	>
		{#each Array(fishCount) as _, i}
			<img
				src="/fish/fish-steps.png"
				alt=""
				class="fish"
				style="
					--offset-x: {i * 24}px;
					--offset-y: {
                        i === 1 ? -10 :
                        i === 2 ? 8 :
                        0
                    }px;
					--delay: {i * 0.15}s;
				"
			/>
		{/each}
	</div>
{/if}

<style>
	.fish-school {
		position: absolute;
		bottom: 55vh;
		left: 0;

		display: flex;
		align-items: center;

		pointer-events: none;
		z-index: 4;
	}

	.fish {
		width: 90px;
		height: auto;

		transform:
			translateX(var(--offset-x))
			translateY(var(--offset-y));

		animation: fish-tail 1.8s ease-in-out infinite;
		animation-delay: var(--delay);
	}

	@keyframes fish-tail {
		0%, 100% {
			transform:
				translateX(var(--offset-x))
				translateY(var(--offset-y))
				rotate(0deg);
		}
		50% {
			transform:
				translateX(calc(var(--offset-x) + 6px))
				translateY(var(--offset-y))
				rotate(2deg);
		}
	}
</style>
