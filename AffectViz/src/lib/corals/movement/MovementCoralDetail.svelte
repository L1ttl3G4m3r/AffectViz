<script>
	import { tick } from 'svelte';
	import { movementConfig } from './movement.config';
	import { scoreTier } from '$lib/utils/scoreTier';

	export let data;

	/* Score tier (used to pick the right text explanation) */
	let tier = 'low';

	/*
		data.growth is expected to be between 0 and 1.
		We convert it to a percentage and map it to a tier.
	*/
	$: if (data?.growth != null) {
		tier = scoreTier(data.growth * 100);
	}

	/* Chart state (D3 renders only when opened) */
	let chartOpen = false;

	/* Chart container element reference */
	let chartEl;

	/* Lazy-loaded D3 instance (only imported when needed) */
	let d3;

	/*
		Opens/closes the chart section.
		If opening:
		- wait for DOM update
		- lazy import D3
		- render chart once
	*/
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

	/* ------------------------------------------------------------
	   D3 CHART RENDERING
	   ------------------------------------------------------------ */
	function renderChart() {
		/* Safety checks */
		if (!chartEl) return;
		if (chartEl.hasChildNodes()) return;
		if (!data?.stepsByDay?.length) return;

		/* Data used for chart bars */
		const stepsByDay = data.stepsByDay;
		const todayIndex = data.todayIndex ?? -1;

		/* Chart sizing */
		const width = chartEl.clientWidth;
		const height = 260;

		/* Inner chart spacing */
		const margin = { top: 30, right: 18, bottom: 35, left: 35 };
		const innerW = width - margin.left - margin.right;
		const innerH = height - margin.top - margin.bottom;

		/* Maximum steps for scaling the Y axis */
		const maxSteps = Math.max(...stepsByDay.map((d) => d.steps ?? 0), 1);

		/* Today's value shown at top */
		const todaySteps = stepsByDay[todayIndex]?.steps ?? 0;

		/* Create SVG root */
		const svg = d3.select(chartEl).append('svg').attr('width', width).attr('height', height);

		/* Inner chart group */
		const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

		/* X axis = day label */
		const x = d3
			.scaleBand()
			.domain(stepsByDay.map((d) => d.label))
			.range([0, innerW])
			.padding(0.55);

		/* Y axis = steps count */
		const y = d3.scaleLinear().domain([0, maxSteps]).nice().range([innerH, 0]);

		/* Y GRID LINES */
		g.append('g')
			.selectAll('line')
			.data(y.ticks(6))
			.enter()
			.append('line')
			.attr('x1', 0)
			.attr('x2', innerW)
			.attr('y1', (d) => y(d))
			.attr('y2', (d) => y(d))
			.attr('stroke', 'rgba(31, 41, 55, 0.35)')
			.attr('stroke-width', 1);

		/* Y AXIS LABELS (0, 1k, 2k...) */
		g.append('g')
			.selectAll('text')
			.data(y.ticks(6))
			.enter()
			.append('text')
			.attr('x', -10)
			.attr('y', (d) => y(d) + 4)
			.attr('text-anchor', 'end')
			.attr('font-size', 12)
			.attr('fill', 'rgba(31, 41, 55, 0.65)')
			.text((d) => (d >= 1000 ? `${d / 1000}k` : d));

		/* BARS (Steps per day) */
		g.selectAll('rect')
			.data(stepsByDay)
			.enter()
			.append('rect')
			.attr('x', (d) => x(d.label))
			.attr('y', (d) => y(d.steps))
			.attr('width', x.bandwidth())
			.attr('height', (d) => innerH - y(d.steps))
			.attr('rx', 12)
			.attr('fill', (_, i) =>
				i === todayIndex
					? 'rgba(0, 170, 200, 1)' // highlight today
					: 'rgba(180, 180, 180, 0.9)'
			);

		/* X LABELS (Mon Tue Wed...) */
		g.append('g')
			.attr('transform', `translate(0, ${innerH + 20})`)
			.selectAll('text')
			.data(stepsByDay)
			.enter()
			.append('text')
			.attr('x', (d) => x(d.label) + x.bandwidth() / 2)
			.attr('text-anchor', 'middle')
			.attr('font-size', 13)
			.attr('fill', (_, i) => (i === todayIndex ? 'rgba(0, 170, 200, 1)' : 'rgba(31, 41, 55, 0.6)'))
			.text((d) => d.label);

		/* TOP LABELS (Steps today) */
		svg
			.append('text')
			.attr('x', margin.left)
			.attr('y', 28)
			.attr('font-size', 34)
			.attr('font-weight', 600)
			.attr('fill', 'rgba(0, 170, 200, 1)')
			.text(todaySteps);

		svg
			.append('text')
			.attr('x', margin.left + 95)
			.attr('y', 28)
			.attr('font-size', 22)
			.attr('fill', 'rgba(0, 170, 200, 1)')
			.text('Steps today');
	}
</script>

<!--
	Movement overlay screen:
	- contains scrollable text/stats panel
	- optional D3 chart for steps-by-day
-->
<section class="movement-overlay">
	<!-- Scroll container (fixed position, matches your overlay style system) -->
	<main class="movement-info-scroll">
		<!-- Tier-based explanation text -->
		<section class="movement-text">
			{#each movementConfig.tiers[tier].text as paragraph}
				<p>{paragraph}</p>
			{/each}
		</section>

		<!-- Summary stats card -->
		<section class="movement-stats">
			<div>
				<strong>Cal burned</strong>
				<span>{data?.calories ?? 0}</span>
			</div>

			<hr class="divider" />

			<div>
				<strong>Time</strong>
				<span>{data?.duration ?? '–'}</span>
			</div>
		</section>

		<!-- Toggle button for showing full chart -->
		<button
			type="button"
			class="graph-toggle"
			aria-expanded={chartOpen}
			aria-controls="movement-chart"
			on:click={toggleChart}
		>
			Look at all movement stats
			<span class:open={chartOpen}>⌄</span>
		</button>

		<!-- Chart (only rendered when opened to avoid extra DOM + heavy rendering) -->
		{#if chartOpen}
			<div class="movement-chart-card">
				<figure id="movement-chart" class="movement-chart" bind:this={chartEl}></figure>
			</div>
		{/if}
	</main>

	<!-- Decorative coral image -->
	<img src="/coralMovement/movement-13.png" alt="" class="movement-overlay-coral" />

	<!-- Screen title (fixed position via CSS) -->
	<h1 class="movement-overlay-title">{movementConfig.title}</h1>
</section>
