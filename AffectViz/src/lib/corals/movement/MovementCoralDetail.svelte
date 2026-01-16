<script>
	import { tick } from 'svelte';
	import { movementConfig } from './movement.config';
	import { scoreTier } from '$lib/utils/scoreTier';

	export let data;

	let tier = 'low';
	$: if (data?.growth != null) tier = scoreTier(data.growth * 100);

	let chartOpen = false;
	let chartEl;
	let d3;

	async function toggleChart() {
		chartOpen = !chartOpen;

		if (chartOpen) {
			await tick();
			if (!d3) d3 = await import('d3');
			renderChart();
		}
	}

	function renderChart() {
		if (!chartEl || chartEl.hasChildNodes()) return;
		if (!data?.stepsByDay?.length) return;

		const stepsByDay = data.stepsByDay;
		const todayIndex = data.todayIndex ?? -1;

		const width = chartEl.clientWidth;
		const height = 260;

		const margin = { top: 30, right: 18, bottom: 35, left: 35 };
		const innerW = width - margin.left - margin.right;
		const innerH = height - margin.top - margin.bottom;

		const maxSteps = Math.max(...stepsByDay.map((d) => d.steps ?? 0), 1);

		const svg = d3
			.select(chartEl)
			.append('svg')
			.attr('width', width)
			.attr('height', height);

		const g = svg
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// ✅ scales
		const x = d3
			.scaleBand()
			.domain(stepsByDay.map((d) => d.label))
			.range([0, innerW])
			.padding(0.55);

		const y = d3
			.scaleLinear()
			.domain([0, maxSteps])
			.nice()
			.range([innerH, 0]);

		// ✅ Y grid lines
		g.append('g')
			.selectAll('line')
			.data(y.ticks(6))
			.enter()
			.append('line')
			.attr('x1', 0)
			.attr('x2', innerW)
			.attr('y1', (d) => y(d))
			.attr('y2', (d) => y(d))
			.attr('stroke', 'rgba(31, 41, 55,0.35)')
			.attr('stroke-width', 1);

		// ✅ Y axis labels (0, 1k, 2k, ...)
		g.append('g')
			.selectAll('text')
			.data(y.ticks(6))
			.enter()
			.append('text')
			.attr('x', -10)
			.attr('y', (d) => y(d) + 4)
			.attr('text-anchor', 'end')
			.attr('font-size', 12)
			.attr('fill', 'rgba(31, 41, 55,0.65)')
			.text((d) => (d >= 1000 ? `${d / 1000}k` : d));

		// ✅ bars
		g.selectAll('rect')
			.data(stepsByDay)
			.enter()
			.append('rect')
			.attr('x', (d) => x(d.label))
			.attr('y', (d) => y(d.steps))
			.attr('width', x.bandwidth())
			.attr('height', (d) => innerH - y(d.steps))
			.attr('rx', 12)
			.attr('fill', (d, i) =>
				i === todayIndex
					? 'rgba(0,170,200,1)'   // ✅ highlighted today
					: 'rgba(180,180,180,0.9)'
			);

		// ✅ X labels (Mon Tue Wed ...)
		g.append('g')
			.attr('transform', `translate(0, ${innerH + 20})`)
			.selectAll('text')
			.data(stepsByDay)
			.enter()
			.append('text')
			.attr('x', (d) => x(d.label) + x.bandwidth() / 2)
			.attr('text-anchor', 'middle')
			.attr('font-size', 13)
			.attr('fill', (d, i) =>
				i === todayIndex
					? 'rgba(0,170,200,1)'
					: 'rgba(31, 41, 55,0.6)'
			)
			.text((d) => d.label);

		// ✅ top labels like the reference
		const todaySteps = stepsByDay[todayIndex]?.steps ?? 0;

		svg.append('text')
			.attr('x', margin.left)
			.attr('y', 28)
			.attr('font-size', 34)
			.attr('font-weight', 600)
			.attr('fill', 'rgba(0,170,200,1)')
			.text(todaySteps);

		svg.append('text')
			.attr('x', margin.left + 95)
			.attr('y', 28)
			.attr('font-size', 22)
			.attr('fill', 'rgba(0,170,200,1)')
			.text('Steps today');
	}
</script>

<section class="movement-overlay">
	<div class="movement-info-scroll">
		<div class="movement-text">
			{#each movementConfig.tiers[tier].text as paragraph}
				<p>{paragraph}</p>
			{/each}
		</div>

		<div class="movement-stats">
			<div>
				<strong>Cal burned</strong>
				<span>{data?.calories ?? 0}</span>
			</div>

			<div class="divider"></div>

			<div>
				<strong>Time</strong>
				<span>{data?.duration ?? '–'}</span>
			</div>
		</div>

		<button class="graph-toggle" on:click={toggleChart}>
			Look at all movement stats
			<span class:open={chartOpen}>⌄</span>
		</button>

		{#if chartOpen}
			<div class="movement-chart-card">
				<div class="movement-chart" bind:this={chartEl}></div>
			</div>
		{/if}
	</div>

	<img src="/coralMovement/movement-13.png" alt="" class="movement-overlay-coral" />
	<h1 class="movement-overlay-title">{movementConfig.title}</h1>
</section>
