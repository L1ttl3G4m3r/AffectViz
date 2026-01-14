<script>
	import { tick } from 'svelte';
	import { workoutConfig } from './workout.config';
	import { scoreTier } from '$lib/utils/scoreTier';

	export let data;

	let tier = 'low';
	let chartOpen = false;
	let chartEl;
	let d3;

	/* ✅ SAFE: reactively derive tier */
	$: if (data?.growth != null) {
		tier = scoreTier(data.growth * 100);
	}

	/* ✅ Lazy-load D3 ONLY when needed */
	async function toggleChart() {
		chartOpen = !chartOpen;

		if (chartOpen) {
			await tick();

			if (!d3) {
				d3 = await import('d3');
			}

			renderChart();
		}
	}

	function renderChart() {
		if (!chartEl || chartEl.hasChildNodes()) return;
		if (!data) return;

		const svg = d3
			.select(chartEl)
			.append('svg')
			.attr('width', '100%')
			.attr('height', 160);

		svg.append('rect')
			.attr('x', 0)
			.attr('y', 60)
			.attr('width', `${Math.min(data.growth * 100, 100)}%`)
			.attr('height', 18)
			.attr('rx', 9)
			.attr('fill', 'rgba(255,255,255,0.8)');
	}
</script>

<section class="workout-overlay">
	<div class="workout-info-scroll">
		<div class="workout-text">
			{#each workoutConfig.tiers[tier].text as paragraph}
				<p>{paragraph}</p>
			{/each}
		</div>

		<div class="workout-stats">
			<div>
				<strong>Cal burned</strong>
				<span>{data?.workoutCalories ?? 0}</span>
			</div>

			<div class="divider"></div>

			<div>
				<strong>Time</strong>
				<span>{data?.workoutDurationMinutes ?? '0'} min</span>
			</div>
		</div>

		<button class="graph-toggle" on:click={toggleChart}>
			Look at all sleep stats
			<span class:open={chartOpen}>⌄</span>
		</button>

		{#if chartOpen}
			<div class="workout-chart" bind:this={chartEl}></div>
		{/if}
	</div>

	<img
		src="/background/sportCoral.png"
		alt=""
		class="workout-overlay-coral"
	/>

	<h1 class="workout-overlay-title">
		{workoutConfig.title}
	</h1>
</section>
