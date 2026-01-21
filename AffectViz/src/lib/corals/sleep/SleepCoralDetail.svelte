<script>
	import { tick } from 'svelte';
	import { sleepConfig } from './sleep.config';
	import { scoreTier } from '$lib/utils/scoreTier';

	export let data;

	/* Tier decides which explanation text is shown */
	let tier = 'low';

	/* Controls whether the chart area is visible */
	let chartOpen = false;

	/* Reference to the chart container element */
	let chartEl;

	/* Lazy-loaded D3 module */
	let d3;

	/*
		data.growth is expected between 0 and 1.
		We convert to percentage for scoreTier().
	*/
	$: if (data?.growth != null) {
		tier = scoreTier(data.growth * 100);
	}

	/* Chart toggle (Lazy-load D3 only when needed) */
	async function toggleChart() {
		chartOpen = !chartOpen;

		/* Only render when opening */
		if (chartOpen) {
			/* Wait for the DOM element to exist */
			await tick();

			/* Import D3 only once */
			if (!d3) {
				d3 = await import('d3');
			}

			renderChart();
		}
	}

	/* ------------------------------------------------------------
	   D3 DONUT CHART RENDERING
	   ------------------------------------------------------------ */
	function renderChart() {
		/* Safety checks */
		if (!chartEl) return;
		if (chartEl.hasChildNodes()) return;
		if (!data || !d3) return;

		/*
			Build sleep stage dataset.
			We only keep stages with a value > 0 so chart stays clean.
		*/
		const stages = [
			{ label: 'DEEP', value: data.deepSleep ?? 0 },
			{ label: 'REM', value: data.remSleep ?? 0 },
			{ label: 'LIGHT', value: data.lightSleep ?? 0 },
			{ label: 'AWAKE', value: data.awake ?? 0 }
		].filter((d) => d.value > 0);

		/* Chart sizing */
		const width = chartEl.clientWidth || 320;
		const height = 260;

		/* Donut radius */
		const radius = Math.min(width, height) / 2 - 10;

		/* Total sleep sum for percentages */
		const total = stages.reduce((sum, d) => sum + d.value, 0);

		/* Create SVG root element */
		const svgRoot = d3.select(chartEl).append('svg').attr('width', width).attr('height', height);

		/* Centered group for donut chart */
		const svg = svgRoot.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

		/* BACKGROUND CIRCLE */
		svg
			.append('circle')
			.attr('r', radius)
			.attr('fill', 'rgba(255,255,255,0.92)')
			.attr('stroke', 'rgba(255,255,255,0.65)')
			.attr('stroke-width', 2);

		/* COLORS (Deep -> Awake) */
		const color = d3
			.scaleOrdinal()
			.domain(stages.map((d) => d.label))
			.range([
				'rgba(17, 139, 168, 0.95)', // Deep
				'rgba(17, 139, 168, 0.75)', // REM
				'rgba(17, 139, 168, 0.55)', // Light
				'rgba(17, 139, 168, 0.25)' // Awake
			]);

		/* PIE / ARC GEOMETRY */
		/* Convert values into angles */
		const pie = d3
			.pie()
			.value((d) => d.value)
			.sort(null);
		const arcs = pie(stages);

		/* Donut thickness */
		const arc = d3
			.arc()
			.innerRadius(radius * 0.28)
			.outerRadius(radius * 0.92);

		/* Label position: center of slice thickness */
		const labelArc = d3
			.arc()
			.innerRadius(radius * 0.62)
			.outerRadius(radius * 0.62);

		/* DONUT SLICES */
		svg
			.selectAll('path')
			.data(arcs)
			.enter()
			.append('path')
			.attr('d', arc)
			.attr('fill', (d) => color(d.data.label))
			.attr('stroke', 'rgba(255,255,255,0.25)')
			.attr('stroke-width', 2);

		/* LABELS (Stage + Percentage) */
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

		/* Stage label */
		labels
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('dy', '-0.25rem')
			.attr('fill', 'white')
			.style('font-size', '14px')
			.style('font-weight', '700')
			.text((d) => d.data.label);

		/* Percentage label */
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

<!-- Sleep overlay screen -->
<section class="sleep-overlay">
	<!-- Scroll container -->
	<main class="sleep-info-scroll">
		<!-- Tier-based explanation text -->
		<section class="sleep-text">
			{#each sleepConfig.tiers[tier].text as paragraph}
				<p>{paragraph}</p>
			{/each}
		</section>

		<!-- Summary stats card -->
		<section class="sleep-stats">
			<div>
				<strong>Sleep</strong>
				<span>{data?.sleepDuration ?? '-'}</span>
			</div>

			<hr class="divider" />

			<div>
				<strong>Quality</strong>
				<span>{data?.sleepScore ?? '–'}</span>
			</div>
		</section>

		<!-- Chart toggle -->
		<button
			type="button"
			class="graph-toggle"
			aria-expanded={chartOpen}
			aria-controls="sleep-chart"
			on:click={toggleChart}
		>
			Look at all sleep stats
			<span class:open={chartOpen}>⌄</span>
		</button>

		<!-- Donut chart container -->
		{#if chartOpen}
			<figure id="sleep-chart" class="sleep-chart" bind:this={chartEl}></figure>
		{/if}
	</main>

	<!-- Decorative coral image -->
	<img src="/coralSleep/sleep-13.png" alt="" class="sleep-overlay-coral" />

	<!-- Screen title -->
	<h1 class="sleep-overlay-title">{sleepConfig.title}</h1>
</section>
