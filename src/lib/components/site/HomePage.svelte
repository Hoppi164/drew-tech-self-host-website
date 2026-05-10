<script lang="ts">
	import CardGrid from '$lib/components/site/CardGrid.svelte';
	import HeroSection from '$lib/components/site/HeroSection.svelte';
	import type { SiteCollection, SiteEntry, SitePage } from '$lib/types/content';
	import { resolveCollectionHref } from '$lib/content/site';

	type Props = {
		title: string;
		tagline: string;
		description: string;
		heroImage: string;
		heroCtaLabel: string;
		heroCtaPath: string;
		pages: SitePage[];
		collections: SiteCollection[];
		entries: SiteEntry[];
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
		entries,
		heroAlign = 'start'
	}: Props = $props();

	function entryHref(entry: SiteEntry) {
		const collection = collections.find((item) => item.slug === entry.collectionSlug);
		return collection ? `/${collection.routeBase}/${entry.slug}` : '/';
	}
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
<CardGrid title="Collections" items={collections} hrefResolver={resolveCollectionHref} />
<CardGrid title="Featured Entries" items={entries} hrefResolver={entryHref} />
