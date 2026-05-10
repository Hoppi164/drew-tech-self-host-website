<script lang="ts">
	import HeroSection from '$lib/components/site/HeroSection.svelte';
	import ThemeFrame from '$lib/components/storybook/ThemeFrame.svelte';
	import type { ThemeKey } from '$lib/types/theme';

	type Props = {
		theme: ThemeKey;
	};

	let { theme }: Props = $props();
</script>

<ThemeFrame {theme} title="HeroSection">
	{#snippet children()}
		<HeroSection
			title="Northwind Studio"
			copy="A static-first website template for small businesses that want a distinct visual voice."
			ctaLabel="Start here"
			ctaPath="/contact"
			image="/uploads/artist-studio.svg"
		/>
	{/snippet}
</ThemeFrame>
