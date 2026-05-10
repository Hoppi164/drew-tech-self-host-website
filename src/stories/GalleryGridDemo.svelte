<script lang="ts">
	import GalleryGrid from '$lib/components/site/GalleryGrid.svelte';
	import ThemeFrame from '$lib/components/storybook/ThemeFrame.svelte';
	import type { ThemeKey } from '$lib/types/theme';
	import { gallery } from './fixtures';

	type Props = {
		theme: ThemeKey;
	};

	let { theme }: Props = $props();
</script>

<ThemeFrame {theme} title="GalleryGrid">
	{#snippet children()}
		<GalleryGrid {gallery} />
	{/snippet}
</ThemeFrame>
