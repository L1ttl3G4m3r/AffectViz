<script>
	export let open = false;
	export let monthName = 'January';
	export let onClose = () => {};
</script>

{#if open}
	<div class="monthly-overlay-root">
		<!-- click outside to close -->
		<button class="monthly-overlay-backdrop" aria-label="Close overlay" on:click={onClose}></button>

		<div class="monthly-overlay-panel" role="dialog" aria-modal="true">
			<!-- Back button -->
			<button class="monthly-overlay-back" on:click={onClose} aria-label="Back"> ← </button>

			<h1 class="monthly-overlay-title">History - {monthName}</h1>

			<p class="monthly-overlay-intro">
				Over the past month, your daily choices <br />
				slowly shaped your reef.
			</p>

			<div class="monthly-overlay-content">
				<!-- Sleep -->
				<div class="monthly-overlay-row">
					<img class="monthly-overlay-coral" src="/coralSleep/sleep-13.png" alt="Sleep coral" />

					<div class="monthly-overlay-text">
						<h2>Sleep Coral</h2>
						<p>
							More consistent sleep supported<br />
							steadier growth toward the end<br />
							of the month.
						</p>
					</div>
				</div>

				<!-- Training -->
				<div class="monthly-overlay-row">
					<img
						class="monthly-overlay-coral"
						src="/background/sportCoral.png"
						alt="Training coral"
					/>

					<div class="monthly-overlay-text">
						<h2>Training Coral</h2>
						<p>
							This month showed more<br />
							training compared to last month.<br />
							Keep up the good work!
						</p>
					</div>
				</div>

				<!-- Movement -->
				<div class="monthly-overlay-row">
					<img
						class="monthly-overlay-coral"
						src="/coralMovement/movement-13.png"
						alt="Movement coral"
					/>

					<div class="monthly-overlay-text">
						<h2>Movement Coral</h2>
						<p>
							Small actions supported steady<br />
							growth in this month.
						</p>
					</div>
				</div>
			</div>

			<p class="monthly-overlay-footer">
				Keep up the good work and help your<br />
				reef grow even more beautiful
			</p>
		</div>
	</div>
{/if}
