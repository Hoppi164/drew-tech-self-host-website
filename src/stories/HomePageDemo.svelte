<script lang="ts">
	import HomePage from '$lib/components/site/HomePage.svelte';
	import ThemeFrame from '$lib/components/storybook/ThemeFrame.svelte';
	import type { ThemeKey } from '$lib/types/theme';
	import { collections, events, gallery, pages, posts } from './fixtures';

	type Props = {
		theme: ThemeKey;
	};

	let { theme }: Props = $props();
</script>

<ThemeFrame {theme} title="HomePage">
	{#snippet children()}
		<HomePage
			title="Northwind Studio"
			tagline="Reusable sites with a distinct visual voice."
			description="The homepage assembles featured content blocks and adapts to each theme pack."
			heroImage={gallery.coverImage}
			heroCtaLabel="Start here"
			heroCtaPath="/contact"
			{pages}
			{collections}
			{posts}
			{events}
			{gallery}
			heroAlign="start"
		/>
	{/snippet}
</ThemeFrame>
