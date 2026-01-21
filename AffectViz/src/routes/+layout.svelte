<script>
	/* Import the favicon file so SvelteKit can bundle it correctly */
	import favicon from '$lib/assets/favicon.svg';

	/* Import global CSS styles for the entire app */
	import '../app.css';

	/*
		SvelteKit passes everything that is inside this layout as "children".
		Example:
		+layout.svelte wraps around +page.svelte automatically.
		So "children" is basically: "render the current page here".
	*/
	let { children } = $props();
</script>

<!--
	The <svelte:head> block lets you add content into the <head> of the HTML page.
	This favicon will be shown in the browser tab.
-->
<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!--
	This renders the page content inside this layout.
	Without this line, none of your pages would appear.
-->
{@render children()}
