<script lang="ts">
	import { getCollection, getEvent, getGallery, getPage, getPost, homepageData, resolveThemeKey } from '$lib/content/site';
	import ContactPanel from '$lib/components/site/ContactPanel.svelte';
	import GalleryGrid from '$lib/components/site/GalleryGrid.svelte';
	import HomePage from '$lib/components/site/HomePage.svelte';
	import RichTextPage from '$lib/components/site/RichTextPage.svelte';
	import SiteShell from '$lib/components/site/SiteShell.svelte';
	import type { EditableEntityType, SiteSnapshot } from '$lib/types/content';
	import { themes } from '$lib/types/theme';

	type Props = {
		snapshot: SiteSnapshot;
		type: EditableEntityType | 'site';
		slug: string;
	};

	let { snapshot, type, slug }: Props = $props();

	const previewItem = $derived.by(() => {
		switch (type) {
			case 'page':
				return getPage(snapshot, slug);
			case 'post':
				return getPost(snapshot, slug);
			case 'event':
				return getEvent(snapshot, slug);
			case 'gallery':
				return getGallery(snapshot, slug);
			case 'collection':
				return getCollection(snapshot, slug);
			default:
				return undefined;
		}
	});

	const previewTheme = $derived(resolveThemeKey(snapshot, previewItem));
	const home = $derived(homepageData(snapshot));
	const previewGallery = $derived(type === 'gallery' ? getGallery(snapshot, slug) : undefined);
</script>

<SiteShell
	theme={previewTheme}
	siteName={snapshot.site.business.name}
	tagline={snapshot.site.business.tagline}
	navigation={snapshot.site.navigation}
	socialLinks={snapshot.site.socialLinks}
	activePath={type === 'site' ? '/' : `/${slug}`}
>
	{#snippet children()}
		{#if type === 'site'}
			<HomePage
				title={snapshot.site.business.name}
				tagline={snapshot.site.business.tagline}
				description={snapshot.site.business.description}
				heroImage={home.gallery?.coverImage ?? '/uploads/artist-studio.svg'}
				heroCtaLabel={snapshot.site.homepage.heroCtaLabel}
				heroCtaPath={snapshot.site.homepage.heroCtaPath}
				pages={home.pages}
				collections={home.collections}
				posts={home.posts}
				events={home.events}
				gallery={home.gallery}
				heroAlign={themes[previewTheme].heroAlign}
			/>
		{:else if type === 'gallery' && previewGallery}
			<GalleryGrid gallery={previewGallery} />
		{:else if slug === 'contact'}
			<ContactPanel {...snapshot.site.contact} />
		{:else if previewItem && 'html' in previewItem}
			<RichTextPage title={previewItem.title} excerpt={previewItem.excerpt} html={previewItem.html} />
		{:else if previewItem}
			<section class="collection">
				<h1>{previewItem.title}</h1>
				<p>{previewItem.description}</p>
			</section>
		{/if}
	{/snippet}
</SiteShell>

<style>
	.collection {
		background: var(--site-surface);
		border: 1px solid var(--site-border);
		border-radius: var(--site-radius);
		padding: 2rem;
	}

	h1 {
		font-family: var(--site-heading-font);
		font-size: clamp(2.2rem, 5vw, 4rem);
		margin: 0 0 1rem;
	}

	p {
		color: var(--site-muted);
		line-height: 1.7;
	}
</style>
