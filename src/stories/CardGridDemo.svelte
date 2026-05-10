<script lang="ts">
	import CardGrid from '$lib/components/site/CardGrid.svelte';
	import ThemeFrame from '$lib/components/storybook/ThemeFrame.svelte';
	import type { ThemeKey } from '$lib/types/theme';
	import { pages } from './fixtures';

	type Props = {
		theme: ThemeKey;
	};

	let { theme }: Props = $props();
</script>

<ThemeFrame {theme} title="CardGrid">
	{#snippet children()}
		<CardGrid title="Featured Pages" items={pages} hrefPrefix="" />
	{/snippet}
</ThemeFrame>
