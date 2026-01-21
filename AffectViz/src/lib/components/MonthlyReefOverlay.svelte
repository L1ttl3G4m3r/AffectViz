<script>
	/* Controls visibility of the overlay */
	export let open = false;

	/* Month name displayed in the title */
	export let monthName = 'January';

	/* Callback that closes the overlay (parent controls state) */
	export let onClose = () => {};
</script>

{#if open}
	<!-- Root container for the monthly history overlay (fullscreen layer) -->
	<div class="monthly-overlay-root">
		<!--
			Backdrop:
			Clicking outside the panel closes the overlay.
			Button is used for accessibility + keyboard support.
		-->
		<button
			type="button"
			class="monthly-overlay-backdrop"
			aria-label="Close overlay"
			on:click={onClose}
		></button>

		<!--
			Main panel:
			role="dialog" + aria-modal makes this a proper modal overlay.
		-->
		<div class="monthly-overlay-panel" role="dialog" aria-modal="true">
			<!-- Header area: Back button + title -->
			<header>
				<button type="button" class="monthly-overlay-back" on:click={onClose} aria-label="Back">
					←
				</button>

				<h1 class="monthly-overlay-title">History - {monthName}</h1>
			</header>

			<!-- Short intro text -->
			<p class="monthly-overlay-intro">
				Over the past month, your daily choices <br />
				slowly shaped your reef.
			</p>

			<!-- Main content: summary rows -->
			<main class="monthly-overlay-content">
				<!-- Sleep -->
				<article class="monthly-overlay-row">
					<img class="monthly-overlay-coral" src="/coralSleep/sleep-13.png" alt="Sleep coral" />

					<div class="monthly-overlay-text">
						<h2>Sleep Coral</h2>
						<p>
							More consistent sleep supported<br />
							steadier growth toward the end<br />
							of the month.
						</p>
					</div>
				</article>

				<!-- Training -->
				<article class="monthly-overlay-row">
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
				</article>

				<!-- Movement -->
				<article class="monthly-overlay-row">
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
				</article>
			</main>

			<!-- Footer message -->
			<footer>
				<p class="monthly-overlay-footer">
					Keep up the good work and help your<br />
					reef grow even more beautiful
				</p>
			</footer>
		</div>
	</div>
{/if}
