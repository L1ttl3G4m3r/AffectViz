<script>
	import { onMount } from 'svelte';

	export let sleepData = null;
    export let onOpen = () => {};

	/* ---------------------------------------
	   CHECK IF LAST NIGHT ≥ 7 HOURS
	--------------------------------------- */
	function hasEnoughSleep(duration) {
		if (!duration || typeof duration !== 'string') return false;

		const match = duration.match(/(\d+)h/);
		if (!match) return false;

		const hours = Number(match[1]);
		return hours >= 7;
	}

	$: showFish = hasEnoughSleep(sleepData?.sleepDuration);

	let x = -160;
	let direction = 1;
	let speed = 0.25; // slower = calmer sleep fish
	let screenWidth = 0;
	let t = 0;

	onMount(() => {
		screenWidth = window.innerWidth;

		const loop = () => {
			x += speed * direction;
			t += 0.015;

			if (direction === 1 && x > screenWidth + 160) {
				direction = -1;
				x = screenWidth + 160;
			}

			if (direction === -1 && x < -160) {
				direction = 1;
				x = -160;
			}

			requestAnimationFrame(loop);
		};

		loop();
	});
</script>

{#if showFish}
    <button
		type="button"
		class="fish-click"
		aria-label="Open sea life details"
		on:click={onOpen}
	>
        <div
            class="fish-sleep"
            style="transform: translateX({x}px) scaleX({direction});"
        >
            <img
                src="/fish/fish-sleep.png"
                alt=""
                class="fish"
                style="--offset-y: {Math.sin(t) * 2}px;"
            />
        </div>
    </button>
{/if}

<style>
	.fish-sleep {
		position: absolute;
		bottom: 80vh; /* higher, calm water */
		left: 0;

		pointer-events: none;
		z-index: 2; /* slightly behind step fish */
	}

	.fish {
		width: 120px;
		height: auto;

		transform: translateY(var(--offset-y));

		animation: sleep-tail 2.4s ease-in-out infinite;
	}

	@keyframes sleep-tail {
		0%, 100% {
			transform: translateY(var(--offset-y)) rotate(0deg);
		}
		50% {
			transform: translateY(var(--offset-y)) rotate(1.5deg);
		}
	}
</style>
