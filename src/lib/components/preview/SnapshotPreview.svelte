<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import CollectionPage from '$lib/components/site/CollectionPage.svelte';
	import ContactPanel from '$lib/components/site/ContactPanel.svelte';
	import EntryPage from '$lib/components/site/EntryPage.svelte';
	import RichTextPage from '$lib/components/site/RichTextPage.svelte';
	import SiteShell from '$lib/components/site/SiteShell.svelte';
	import {
		getCollection,
		getCollectionForEntry,
		getEntriesForCollection,
		getEntry,
		getHomePage,
		getPage,
		resolvePreviewSelectionForPath,
		resolveThemeKey
	} from '$lib/content/site';
	import type { PreviewSelection } from '$lib/components/admin/types';
	import type { EditableEntityType, SiteSnapshot } from '$lib/types/content';

	type Props = {
		snapshot: SiteSnapshot;
		type: EditableEntityType | 'site';
		slug: string;
		collectionSlug?: string;
		onNavigate?: ((selection: PreviewSelection) => void) | undefined;
	};

	let { snapshot, type, slug, collectionSlug, onNavigate }: Props = $props();

	const previewPage = $derived(type === 'page' ? getPage(snapshot, slug) : undefined);
	const previewCollection = $derived(
		type === 'collection'
			? getCollection(snapshot, slug)
			: type === 'entry' && collectionSlug
				? getCollection(snapshot, collectionSlug)
				: undefined
	);
	const previewEntry = $derived(
		type === 'entry' && collectionSlug ? getEntry(snapshot, collectionSlug, slug) : undefined
	);

	const previewTheme = $derived(
		resolveThemeKey(snapshot, previewEntry ?? previewCollection ?? previewPage)
	);
	const homePage = $derived(getHomePage(snapshot));
	const transitionKey = $derived(
		type === 'site'
			? `site:${homePage?.slug ?? 'none'}`
			: type === 'page' && previewPage
				? `page:${previewPage.slug}`
				: type === 'collection' && previewCollection
					? `collection:${previewCollection.slug}`
					: type === 'entry' && previewEntry
						? `entry:${previewEntry.collectionSlug}:${previewEntry.slug}`
						: 'empty'
	);

	function handlePreviewNavigate(path: string) {
		const selection = resolvePreviewSelectionForPath(snapshot, path);
		if (selection && onNavigate) {
			onNavigate(selection);
		}
	}
</script>

{#key transitionKey}
	<div class="preview-transition" in:fade={{ duration: 260, easing: cubicOut }}>
		<SiteShell
			theme={previewTheme}
			siteName={snapshot.site.business.name}
			tagline={snapshot.site.business.tagline}
			navigation={snapshot.site.navigation}
			onNavigate={onNavigate ? handlePreviewNavigate : undefined}
			socialLinks={snapshot.site.socialLinks}
			activePath={
				type === 'site'
					? '/'
					: type === 'page' && previewPage
						? `/${previewPage.slug}`
						: previewCollection
							? `/${previewCollection.routeBase}`
							: '/'
			}
		>
			{#snippet children()}
				{#if type === 'site'}
					{#if homePage?.slug === 'contact'}
						<ContactPanel {...snapshot.site.contact} />
					{:else if homePage}
						<RichTextPage title={homePage.title} excerpt={homePage.excerpt} html={homePage.html} />
					{/if}
				{:else if type === 'page' && previewPage}
					{#if previewPage.slug === 'contact'}
						<ContactPanel {...snapshot.site.contact} />
					{:else}
						<RichTextPage title={previewPage.title} excerpt={previewPage.excerpt} html={previewPage.html} />
					{/if}
				{:else if type === 'collection' && previewCollection}
					<CollectionPage collection={previewCollection} entries={getEntriesForCollection(snapshot, previewCollection.slug)} />
				{:else if type === 'entry' && previewCollection && previewEntry}
					<EntryPage collection={previewCollection} entry={previewEntry} />
				{/if}
			{/snippet}
		</SiteShell>
	</div>
{/key}

<style>
	.preview-transition {
		min-height: 100%;
	}
</style>
