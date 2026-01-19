<script>
	import { onMount } from 'svelte';

	export let workoutData = null;
    export let onOpen = () => {};

	/* ---------------------------------------
	   COUNT WORKOUTS THIS WEEK
	--------------------------------------- */
	$: workoutsThisWeek =
		workoutData?.plumes?.filter(p => p.visible).length ?? 0;

	/* ---------------------------------------
	   WORKOUT → FISH RULES
	   1 fish = 1 workout
	   2 fish = 3 workouts
	--------------------------------------- */
	$: fishCount =
		workoutsThisWeek >= 3 ? 2 :
		workoutsThisWeek >= 1 ? 1 : 0;

	let x = -200;
	let direction = 1;
	let speed = 0.4;
	let screenWidth = 0;
	let t = 0;

	onMount(() => {
		screenWidth = window.innerWidth;

		const loop = () => {
			x += speed * direction;
			t += 0.02;

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
    <button
        type="button"
        class="fish-click"
        aria-label="Open sea life details"
        on:click={onOpen}
    >
        <div
            class="fish-school workout"
            style="transform: translateX({x}px) scaleX({direction});"
        >
            {#each Array(fishCount) as _, i}
                <img
                    src="/fish/fish-workout.png"
                    alt=""
                    class="fish"
                    style="
                        --offset-x: {i * 26}px;
                        --offset-y: {
                            (i === 1 ? -8 : 0)
                            + Math.sin(t + i) * 1.5
                        }px;
                    "
                />
            {/each}
        </div>
    </button>
{/if}

<style>
	.fish-school.workout {
		position: absolute;
		bottom: 20vh; /* lower than step fish */
		left: 0;

		display: flex;
		align-items: center;

		pointer-events: none;
		z-index: 11;
	}

	.fish {
		width: 60px;
		height: auto;

		transform:
			translateX(var(--offset-x))
			translateY(var(--offset-y));

		animation: fish-tail 1.6s ease-in-out infinite;
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
				translateX(calc(var(--offset-x) + 5px))
				translateY(var(--offset-y))
				rotate(2deg);
		}
	}
</style>
