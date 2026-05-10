<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Static Small-Business Template</title>
	<meta
		name="description"
		content="Reusable SvelteKit small-business website template with a PAT-based GitHub CMS."
	/>
</svelte:head>

{@render children()}

<style>
	:global(body) {
		margin: 0;
		font-family: system-ui, sans-serif;
		background: #f6f7fb;
	}

	:global(*) {
		box-sizing: border-box;
	}
</style>
