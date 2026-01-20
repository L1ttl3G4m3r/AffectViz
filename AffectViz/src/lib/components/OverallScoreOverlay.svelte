<script>
	export let overallScore = null;
	export let sleepScore = 0;
	export let cardioScore = 0;
	export let onClose = () => {};

	const circumference = (r) => 2 * Math.PI * r;
	const dashOffset = (score, r) => circumference(r) * (1 - score / 100);
</script>

<div class="overall-detail-root" role="dialog" aria-modal="true">
	<button class="overall-detail-backdrop" aria-label="Close overlay" on:click={onClose}></button>

	<div class="overall-detail-panel">
		<div class="overall-detail-header">
			<button class="overall-detail-back" aria-label="Go back" on:click={onClose}>‹</button>
		</div>

		<h1 class="overall-detail-title">Overall Score</h1>
		<p class="overall-detail-subtitle">
			Each day, your choices shape your reef<br />
			over time.
		</p>

		<div class="overall-detail-content">
			<!-- Sleep Row -->
			<div class="overall-detail-row">
				<div class="overall-detail-ring">
					<svg viewBox="0 0 80 80">
						<circle
							cx="40"
							cy="40"
							r="26"
							stroke="rgba(255,255,255,0.2)"
							stroke-width="6"
							fill="none"
						/>

						<circle
							cx="40"
							cy="40"
							r="26"
							stroke="var(--ring-sleep)"
							stroke-width="6"
							fill="none"
							stroke-linecap="round"
							stroke-dasharray={circumference(26)}
							stroke-dashoffset={dashOffset(sleepScore, 26)}
							transform="rotate(-90 40 40)"
						/>
					</svg>

					<div class="overall-detail-percent">{sleepScore}%</div>
				</div>

				<div class="overall-detail-text">
					<h2>Sleep Score</h2>
					<p>
						Your sleep quality is measured by how much restorative sleep you get, including REM
						sleep, how often your sleep was interrupted, and how consistent your nights were.
					</p>
				</div>
			</div>

			<!-- Cardio Row -->
			<div class="overall-detail-row">
				<div class="overall-detail-ring">
					<svg viewBox="0 0 80 80">
						<circle
							cx="40"
							cy="40"
							r="26"
							stroke="rgba(255,255,255,0.2)"
							stroke-width="6"
							fill="none"
						/>

						<circle
							cx="40"
							cy="40"
							r="26"
							stroke="var(--ring-cardio)"
							stroke-width="6"
							fill="none"
							stroke-linecap="round"
							stroke-dasharray={circumference(26)}
							stroke-dashoffset={dashOffset(cardioScore, 26)}
							transform="rotate(-90 40 40)"
						/>
					</svg>

					<div class="overall-detail-percent">{cardioScore}%</div>
				</div>

				<div class="overall-detail-text">
					<h2>Cardio load</h2>
					<p>
						This reflects how well your activity and step levels were balanced with your stress
						levels. A fuller circle means your movement supported your body without adding extra
						strain.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
