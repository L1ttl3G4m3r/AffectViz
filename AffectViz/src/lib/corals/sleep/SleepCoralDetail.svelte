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
		if (!data || !d3) return;

		const stages = [
			{ label: 'DEEP', value: data.deepSleep ?? 0 },
			{ label: 'REM', value: data.remSleep ?? 0 },
			{ label: 'LIGHT', value: data.lightSleep ?? 0 },
			{ label: 'AWAKE', value: data.awake ?? 0 }
		].filter((d) => d.value > 0);

		const width = chartEl.clientWidth || 320;
		const height = 260;

		const radius = Math.min(width, height) / 2 - 10;

		// ✅ Create svg
		const svgRoot = d3
			.select(chartEl)
			.append('svg')
			.attr('width', width)
			.attr('height', height);

		const svg = svgRoot
			.append('g')
			.attr('transform', `translate(${width / 2}, ${height / 2})`);

		// ✅ Circular background (behind donut)
		svg.append('circle')
			.attr('r', radius)
			.attr('fill', 'rgba(255,255,255,0.92)')
			.attr('stroke', 'rgba(255,255,255,0.65)')
			.attr('stroke-width', 2);

		// ✅ Colors
		const color = d3
			.scaleOrdinal()
			.domain(stages.map((d) => d.label))
			.range([
				'rgba(17, 139, 168, 0.95)', // Deep
				'rgba(17, 139, 168, 0.75)', // REM
				'rgba(17, 139, 168, 0.55)', // Light
				'rgba(17, 139, 168, 0.25)' // Awake
			]);

		const total = stages.reduce((sum, d) => sum + d.value, 0);

		const pie = d3
			.pie()
			.value((d) => d.value)
			.sort(null);

		const arcs = pie(stages);

		// ✅ Thicker donut (smaller hole)
		const arc = d3
			.arc()
			.innerRadius(radius * 0.28)
			.outerRadius(radius * 0.92);

		// ✅ label sits in the middle of the slice thickness
		const labelArc = d3
			.arc()
			.innerRadius(radius * 0.62)
			.outerRadius(radius * 0.62);

		// Donut slices
		svg.selectAll('path')
			.data(arcs)
			.enter()
			.append('path')
			.attr('d', arc)
			.attr('fill', (d) => color(d.data.label))
			.attr('stroke', 'rgba(255,255,255,0.25)')
			.attr('stroke-width', 2);

		// ✅ Text group inside slices (label + percentage)
		const labels = svg
			.selectAll('.slice-label')
			.data(arcs)
			.enter()
			.append('g')
			.attr('class', 'slice-label')
			.attr('transform', (d) => {
				const [x, y] = labelArc.centroid(d);
				return `translate(${x}, ${y})`;
			});

		labels
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('dy', '-0.25rem')
			.attr('fill', 'white')
			.style('font-size', '14px')
			.style('font-weight', '700')
			.text((d) => d.data.label);

		labels
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('dy', '1.05rem')
			.attr('fill', 'white')
			.style('font-size', '13px')
			.style('font-weight', '500')
			.text((d) => {
				const pct = total > 0 ? Math.round((d.data.value / total) * 100) : 0;
				return `${pct}%`;
			});
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
				<span>{data?.sleepDuration ?? '-'}</span>
			</div>

			<div class="divider"></div>

			<div>
				<strong>Quality</strong>
				<span>{data?.sleepScore ?? '–'}</span>
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
