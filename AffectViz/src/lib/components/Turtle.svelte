<script>
	import { onMount } from 'svelte';

	export let movementData = null;
	export let workoutData = null;
	export let sleepData = null;

    export let onOpen = () => {};

	/* ---------------------------------------
	   CONDITIONS
	--------------------------------------- */

	// 1️⃣ Steps fish must be 3
	$: stepsReady =
		(movementData?.totalSteps ?? 0) >= 55000;

	// 2️⃣ Workout fish must be 2 (≥ 3 workouts)
	$: workoutReady =
		(workoutData?.plumes?.filter(p => p.visible).length ?? 0) >= 3;

	// 3️⃣ Sleep fish must be visible (≥ 7h)
	function hasEnoughSleep(duration) {
		if (!duration || typeof duration !== 'string') return false;
		const match = duration.match(/(\d+)h/);
		return match ? Number(match[1]) >= 7 : false;
	}

	$: sleepReady =
		hasEnoughSleep(sleepData?.sleepDuration);

	// 🐢 FINAL CONDITION
	$: visible =
		stepsReady && workoutReady && sleepReady;

	/* ---------------------------------------
	   MOTION (same as before)
	--------------------------------------- */

	let x = -220;
	let direction = 1;
	let speed = 0.18;
	let screenWidth = 0;
	let t = 0;

	onMount(() => {
		screenWidth = window.innerWidth;

		const loop = () => {
			if (!visible) {
				requestAnimationFrame(loop);
				return;
			}

			x += speed * direction;
			t += 0.01;

			if (direction === 1 && x > screenWidth + 220) {
				direction = -1;
				x = screenWidth + 220;
			}

			if (direction === -1 && x < -220) {
				direction = 1;
				x = -220;
			}

			requestAnimationFrame(loop);
		};

		loop();
	});
</script>

{#if visible}
    <button
        type="button"
        class="fish-click"
        aria-label="Open sea life details"
        on:click={onOpen}
    >
        <div
            class="turtle"
            style="transform: translateX({x}px) scaleX({direction});"
        >
            <img
                src="/fish/turtle.png"
                alt=""
                class="turtle-img"
                style="--float: {Math.sin(t) * 4}px;"
            />
        </div>
    </button>
{/if}

<style>
	.turtle {
		position: absolute;
		bottom: 18vh; /* near seabed */
		left: 0;

		pointer-events: none;
		z-index: 12; /* behind fish, in front of background */
	}

	.turtle-img {
		width: 72px;
		height: auto;

		transform: translateY(var(--float));

		animation: turtle-flap 3.8s ease-in-out infinite;
	}

	@keyframes turtle-flap {
		0%, 100% {
			transform: translateY(var(--float)) rotate(0deg);
		}
		50% {
			transform: translateY(var(--float)) rotate(1deg);
		}
	}
</style>
