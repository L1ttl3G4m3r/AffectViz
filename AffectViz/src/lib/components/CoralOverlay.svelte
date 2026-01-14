<script>
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';

	export let open = false;

	const dispatch = createEventDispatcher();

	function close() {
		dispatch('close');
	}

	// Prevent background scroll on iOS
	onMount(() => {
		document.body.style.overflow = 'hidden';
	});

	onDestroy(() => {
		document.body.style.overflow = '';
	});
</script>

{#if open}
	<div class="coral-overlay-root">
		<button
      type="button"
      class="coral-overlay-backdrop"
      aria-label="Close overlay"
      on:click={close}
    ></button>

		<div class="coral-overlay-panel">
			<header class="overlay-header">
				<button
					class="back-button"
					aria-label="Back"
					on:click={close}
				>
					←
				</button>
			</header>

			<section class="overlay-content">
				<slot />
			</section>
		</div>
	</div>
{/if}
