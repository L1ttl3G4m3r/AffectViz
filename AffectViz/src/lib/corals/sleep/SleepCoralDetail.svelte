<script>
	import { tick } from 'svelte';
	import { sleepConfig } from './sleep.config';
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

<section class="sleep-overlay">
	<div class="sleep-info-scroll">
		<div class="sleep-text">
			{#each sleepConfig.tiers[tier].text as paragraph}
				<p>{paragraph}</p>
			{/each}
		</div>

		<div class="sleep-stats">
			<div>
				<strong>Sleep</strong>
				<span>{data?.duration ?? 0}</span>
			</div>

			<div class="divider"></div>

			<div>
				<strong>Quality</strong>
				<span>{data?.quality ?? '–'}</span>
			</div>
		</div>

		<button class="graph-toggle" on:click={toggleChart}>
			Look at all sleep stats
			<span class:open={chartOpen}>⌄</span>
		</button>

		{#if chartOpen}
			<div class="sleep-chart" bind:this={chartEl}></div>
		{/if}
	</div>

	<img
		src="/coralSleep/sleep-13.png"
		alt=""
		class="sleep-overlay-coral"
	/>

	<h1 class="sleep-overlay-title">
		{sleepConfig.title}
	</h1>
</section>
