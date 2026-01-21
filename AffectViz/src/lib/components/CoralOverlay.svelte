<script>
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';

	/* Controls whether the overlay is visible */
	export let open = false;

	/* Lets the component send events to the parent */
	const dispatch = createEventDispatcher();

	/* Notify parent: overlay should close */
	function close() {
		dispatch('close');
	}

	/*
		Disable background scrolling while the overlay is open.
		This prevents "scroll bleed", especially on iOS.
	*/
	onMount(() => {
		document.body.style.overflow = 'hidden';
	});

	/* Restore normal scrolling when overlay is removed */
	onDestroy(() => {
		document.body.style.overflow = '';
	});
</script>

{#if open}
	<!-- Root wrapper for the full-screen overlay (handles stacking/z-index) -->
	<div class="coral-overlay-root">
		<button type="button" class="coral-overlay-backdrop" aria-label="Close overlay" on:click={close}
		></button>

		<div class="coral-overlay-panel">
			<header class="overlay-header">
				<button type="button" class="back-button" aria-label="Back" on:click={close}> ← </button>
			</header>

			<!--
				Main overlay content area:
				Slot content gets injected here from the parent component.
			-->
			<section class="overlay-content">
				<slot />
			</section>
		</div>
	</div>
{/if}
