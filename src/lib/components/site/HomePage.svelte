<script lang="ts">
	import CardGrid from '$lib/components/site/CardGrid.svelte';
	import GalleryGrid from '$lib/components/site/GalleryGrid.svelte';
	import HeroSection from '$lib/components/site/HeroSection.svelte';
	import type { SiteCollection, SiteEvent, SiteGallery, SitePage, SitePost } from '$lib/types/content';

	type Props = {
		title: string;
		tagline: string;
		description: string;
		heroImage: string;
		heroCtaLabel: string;
		heroCtaPath: string;
		pages: SitePage[];
		collections: SiteCollection[];
		posts: SitePost[];
		events: SiteEvent[];
		gallery?: SiteGallery;
		heroAlign?: 'start' | 'center';
	};

	let {
		title,
		tagline,
		description,
		heroImage,
		heroCtaLabel,
		heroCtaPath,
		pages,
		collections,
		posts,
		events,
		gallery,
		heroAlign = 'start'
	}: Props = $props();
</script>

<HeroSection
	title={title}
	copy={`${tagline} ${description}`}
	ctaLabel={heroCtaLabel}
	ctaPath={heroCtaPath}
	image={heroImage}
	align={heroAlign}
/>

<CardGrid title="Featured Pages" items={pages} hrefPrefix="" />
<CardGrid title="Collections" items={collections} hrefPrefix="/collections" />
{#if gallery}
	<GalleryGrid {gallery} />
{/if}
<CardGrid title="Journal" items={posts} hrefPrefix="/posts" />
<CardGrid title="Events" items={events} hrefPrefix="/events" />
