<script>
	/* Percentage scores (0 - 100) */
	export let sleepScore = 0;
	export let cardioScore = 0;

	/* Callback to close the overlay */
	export let onClose = () => {};

	/* Radius used for both ring graphs */
	const RING_RADIUS = 26;

	/* Calculate full circumference of the circle */
	const circumference = (r) => 2 * Math.PI * r;

	/*
		Stroke-dashoffset controls how much of the ring is visible:

		- 100% score → dashOffset = 0 (full ring)
		- 0% score   → dashOffset = full circumference (empty ring)
	*/
	const dashOffset = (score, r) => circumference(r) * (1 - score / 100);
</script>

<!--
	Root overlay wrapper:
	role="dialog" + aria-modal ensures this acts like a modal overlay
-->
<div class="overall-detail-root" role="dialog" aria-modal="true">
	<!--
		Backdrop:
		Clicking outside closes the overlay.
		Button is used for accessibility (keyboard + screen readers).
	-->
	<button
		type="button"
		class="overall-detail-backdrop"
		aria-label="Close overlay"
		on:click={onClose}
	></button>

	<!-- Main overlay panel (blur background lives in CSS) -->
	<div class="overall-detail-panel">
		<!-- Header area: back button -->
		<header class="overall-detail-header">
			<button type="button" class="overall-detail-back" aria-label="Go back" on:click={onClose}>
				←
			</button>
		</header>

		<!-- Overlay title + introduction -->
		<h1 class="overall-detail-title">Overall Score</h1>

		<p class="overall-detail-subtitle">
			Each day, your choices shape your reef<br />
			over time.
		</p>

		<!-- Main content section: individual score explanations -->
		<main class="overall-detail-content">
			<!-- =====================================================
			     Sleep Score Row
			     ===================================================== -->
			<article class="overall-detail-row">
				<!-- Ring container -->
				<div class="overall-detail-ring">
					<!-- Score ring visual -->
					<svg viewBox="0 0 80 80" aria-hidden="true">
						<!-- Background ring -->
						<circle
							cx="40"
							cy="40"
							r={RING_RADIUS}
							stroke="rgba(255,255,255,0.2)"
							stroke-width="6"
							fill="none"
						/>

						<!-- Progress ring -->
						<circle
							cx="40"
							cy="40"
							r={RING_RADIUS}
							stroke="var(--ring-sleep)"
							stroke-width="6"
							fill="none"
							stroke-linecap="round"
							stroke-dasharray={circumference(RING_RADIUS)}
							stroke-dashoffset={dashOffset(sleepScore, RING_RADIUS)}
							transform="rotate(-90 40 40)"
						/>
					</svg>

					<!-- Percentage text displayed in the center of the ring -->
					<div class="overall-detail-percent">{sleepScore}%</div>
				</div>

				<!-- Text explanation -->
				<section class="overall-detail-text">
					<h2>Sleep Score</h2>
					<p>
						Your sleep quality is measured by how much restorative sleep you get, including REM
						sleep, how often your sleep was interrupted, and how consistent your nights were.
					</p>
				</section>
			</article>

			<!-- =====================================================
			     Cardio Load Row
			     ===================================================== -->
			<article class="overall-detail-row">
				<!-- Ring container -->
				<div class="overall-detail-ring">
					<!-- Score ring visual -->
					<svg viewBox="0 0 80 80" aria-hidden="true">
						<!-- Background ring -->
						<circle
							cx="40"
							cy="40"
							r={RING_RADIUS}
							stroke="rgba(255,255,255,0.2)"
							stroke-width="6"
							fill="none"
						/>

						<!-- Progress ring -->
						<circle
							cx="40"
							cy="40"
							r={RING_RADIUS}
							stroke="var(--ring-cardio)"
							stroke-width="6"
							fill="none"
							stroke-linecap="round"
							stroke-dasharray={circumference(RING_RADIUS)}
							stroke-dashoffset={dashOffset(cardioScore, RING_RADIUS)}
							transform="rotate(-90 40 40)"
						/>
					</svg>

					<!-- Percentage text displayed in the center of the ring -->
					<div class="overall-detail-percent">{cardioScore}%</div>
				</div>

				<!-- Text explanation -->
				<section class="overall-detail-text">
					<h2>Cardio load</h2>
					<p>
						This reflects how well your activity and step levels were balanced with your stress
						levels. A fuller circle means your movement supported your body without adding extra
						strain.
					</p>
				</section>
			</article>
		</main>
	</div>
</div>
