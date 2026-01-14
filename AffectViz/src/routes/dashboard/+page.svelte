<script>
	import { onMount } from 'svelte';

	/* ================= Overlay ================= */

	import CoralOverlay from '$lib/components/CoralOverlay.svelte';
	import MovementCoralDetail from '$lib/corals/movement/MovementCoralDetail.svelte';
	import { active } from 'd3';

	let activeCoral = null;
	let movementData = null;

	/* ================= Water animation ================= */

	let canvas;
	let ctx;
	let t = 0;
	const dpr = window.devicePixelRatio || 1;

	function resize() {
		const w = window.innerWidth;
		const h = window.innerHeight;

		canvas.width = w * dpr;
		canvas.height = h * dpr;

		canvas.style.width = w + 'px';
		canvas.style.height = h + 'px';

		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	}

	function noise(x, y, t) {
		return (
			Math.sin(x * 0.014 + t) +
			Math.sin(y * 0.018 + t * 1.2) +
			Math.sin((x + y) * 0.009 + t * 0.6)
		);
	}

	function draw() {
		const w = canvas.width / dpr;
		const h = canvas.height / dpr;

		ctx.clearRect(0, 0, w, h);
		ctx.globalCompositeOperation = 'lighter';

		for (let y = 0; y < h; y += 2) {
			for (let x = 0; x < w; x += 2) {
				const n = noise(x, y, t);
				const intensity = Math.max(0, n) * 0.35;

				if (intensity > 0.04) {
					ctx.fillStyle = `rgba(160,220,245,${Math.min(intensity, 0.08)})`;
					ctx.fillRect(x, y, 2, 2);
				}
			}
		}

		ctx.globalCompositeOperation = 'source-over';
		t += 0.01;
		requestAnimationFrame(draw);
	}

	/* ================= Scores ================= */

	let overallScore = null;
	let sleepScore = 0;
	let cardioScore = 0;

	/* ================= Coral State ================= */

	let movementState = 0;
	const MOVEMENT_STATES = 14;

	let sleepState = 0;
	const SLEEP_STATES = 14;

	let workoutPlumes = Array.from({ length: 7 }, () => ({ visible: false }));

	/* ================= SVG math ================= */

	const circumference = (r) => 2 * Math.PI * r;
	const dashOffset = (score, r) =>
		circumference(r) * (1 - score / 100);

	function polarToCartesian(cx, cy, r, percent) {
		const angle = (percent / 100) * 2 * Math.PI - Math.PI / 2;
		return {
			x: cx + r * Math.cos(angle),
			y: cy + r * Math.sin(angle)
		};
	}

	/* ================= Mount ================= */

	onMount(async () => {
		ctx = canvas.getContext('2d');
		resize();
		window.addEventListener('resize', resize);
		draw();

		/* ---------- Scores ---------- */
		const res = await fetch('/api/overall-score', { credentials: 'include' });
		const scoreData = await res.json();

		overallScore = scoreData.overallScore ?? null;
		sleepScore = scoreData.sleepScore ?? 0;
		cardioScore = scoreData.cardioScore ?? 0;

		/* ---------- Movement coral ---------- */
		const movementRes = await fetch('/api/movement-coral', { credentials: 'include' });
		movementData = await movementRes.json();

		const movementGrowth = movementData?.growth ?? 0;
		movementState = Math.min(
			MOVEMENT_STATES - 1,
			Math.floor(movementGrowth * MOVEMENT_STATES)
		);

		/* ---------- Sleep coral ---------- */
		const sleepRes = await fetch('/api/sleep-coral', { credentials: 'include' });
		const sleepGrowth = (await sleepRes.json())?.growth ?? 0;
		sleepState = Math.min(
			SLEEP_STATES - 1,
			Math.floor(sleepGrowth * SLEEP_STATES)
		);

		/* ---------- Workout plumes ---------- */
		const workoutRes = await fetch('/api/workout-coral', { credentials: 'include' });
		const workoutJson = await workoutRes.json();

		workoutPlumes = (workoutJson?.plumes ?? []).map(v =>
			typeof v === 'object'
				? v
				: { visible: Boolean(v) }
		);
	});
</script>

<div class="dashboard-page">
	<canvas class="water-canvas" bind:this={canvas}></canvas>

	<!-- Top navigation -->
	<div class="top-nav">
		<button class="bubble-button" aria-label="History">
			<img src="/icons/clock.png" alt="" class="icon static" />
			<img src="/icons/clock.gif" alt="" class="icon animated" />
		</button>

		<button class="bubble-button" aria-label="Settings">
			<img src="/icons/settings.png" alt="" class="icon static" />
			<img src="/icons/settings.gif" alt="" class="icon animated" />
		</button>
	</div>

	<!-- Overall score -->
	<div class="overall-score-container">
		<div class="overall-score-label">Daily score</div>
		<div class="overall-score-bubble">
			<svg viewBox="0 0 80 80">
				<circle
					cx="40"
					cy="40"
					r="24"
					stroke="rgba(255,255,255,0.15)"
					stroke-width="3"
					fill="none"
				/>
				<circle
					cx="40"
					cy="40"
					r="18"
					stroke="rgba(255,255,255,0.15)"
					stroke-width="3"
					fill="none"
				/>

				<circle
					cx="40"
					cy="40"
					r="24"
					stroke="var(--ring-cardio)"
					stroke-width="3"
					fill="none"
					stroke-linecap="round"
					stroke-dasharray={circumference(24)}
					stroke-dashoffset={dashOffset(cardioScore, 24)}
					transform="rotate(-90 40 40)"
				/>

				<circle
					cx="40"
					cy="40"
					r="18"
					stroke="var(--ring-sleep)"
					stroke-width="3"
					fill="none"
					stroke-linecap="round"
					stroke-dasharray={circumference(18)}
					stroke-dashoffset={dashOffset(sleepScore, 18)}
					transform="rotate(-90 40 40)"
				/>
			</svg>

			<div class="score-text">{overallScore ?? '–'}%</div>
		</div>
	</div>

	<img src="/background/rock.png" alt="" class="rock-layer" />

	<!-- Movement coral -->
	<button
		type="button"
		class="movement-coral"
		aria-label="Open movement coral details"
		on:click={() => activeCoral = 'movement'}
	>
		<img
			src={`/coralMovement/movement-${movementState}.png`}
			alt=""
			class="movement-coral-image"
		/>
	</button>

	<!-- Sleep coral (reuses movement overlay for now) -->
	<button
		type="button"
		class="sleep-coral"
		aria-label="Open sleep coral details"
		on:click={() => activeCoral = 'sleep'}
	>
		<img
			src={`/coralSleep/sleep-${sleepState}.png`}
			alt=""
			class="sleep-coral-image"
		/>
	</button>

	<!-- Workout coral -->
	<button
		type="button"
		class="sport-coral"
		aria-label="Open sport coral details"
		on:click={() => activeCoral = 'sport'}
	>
		<img
			src="/background/sportCoral.png"
			alt=""
			class="sport-coral-image"
		/>

		{#each workoutPlumes as plume, i}
			{#if plume.visible}
				<img
					src={`/coralWorkout/plume-${i}.png`}
					alt=""
					class={`workout-plume plume-${i}`}
				/>
			{/if}
		{/each}
	</button>
</div>

<!-- Movement overlay -->
{#if activeCoral}
	<CoralOverlay
		open
		title=""
		on:close={() => activeCoral = null}
	>
		{#if activeCoral === 'movement' && movementData}
			<MovementCoralDetail data={movementData} />
		{:else if activeCoral === 'sport'}
			<p style="color:white; padding:2rem">
				Sport coral overlay coming soon
			</p>
		{:else if activeCoral === 'sleep'}
			<p style="color:white; padding:2rem">
				Sleep coral overlay coming soon
			</p>
		{:else}
			<p style="color:white; padding:2rem">
				Loading…
			</p>
		{/if}
	</CoralOverlay>
{/if}
