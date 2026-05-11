<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import AdminCollectionEditor from '$lib/components/admin/AdminCollectionEditor.svelte';
	import AdminEntryEditor from '$lib/components/admin/AdminEntryEditor.svelte';
	import AdminPageEditor from '$lib/components/admin/AdminPageEditor.svelte';
	import AdminSiteEditor from '$lib/components/admin/AdminSiteEditor.svelte';
	import type { AdminViewType, UploadMeta } from '$lib/components/admin/types';
	import type { ImageAsset, SiteCollection, SiteEntry, SitePage, SiteSnapshot } from '$lib/types/content';

	type Props = {
		activeType: AdminViewType;
		snapshot: SiteSnapshot;
		selectedPage?: SitePage;
		selectedCollection?: SiteCollection;
		selectedEntry?: SiteEntry;
		onUpdateSiteField: (path: string, value: string) => void;
		onUpdateNavigationItem: (index: number, field: 'label' | 'path', value: string) => void;
		onAddNavigationItem: () => void;
		onMoveNavigationItem: (index: number, direction: -1 | 1) => void;
		onRemoveNavigationItem: (index: number) => void;
		onUpdatePageField: <K extends keyof SitePage>(
			page: SitePage,
			field: K,
			value: SitePage[K]
		) => void;
		onUpdateContactField: (
			field: keyof SiteSnapshot['site']['contact'],
			value: string
		) => void;
		onUpdatePageSlug: (page: SitePage, slug: string) => void;
		onDeletePage: (page: SitePage) => void;
		onUpdateCollectionField: <K extends keyof SiteCollection>(
			collection: SiteCollection,
			field: K,
			value: SiteCollection[K]
		) => void;
		onUpdateCollectionSlug: (collection: SiteCollection, slug: string) => void;
		onUpdateCollectionRouteBase: (collection: SiteCollection, value: string) => void;
		onUpdateCollectionKind: (collection: SiteCollection, kind: SiteCollection['kind']) => void;
		onDeleteCollection: (collection: SiteCollection) => void;
		onUpdateEntryField: (entry: SiteEntry, patch: Partial<SiteEntry>) => void;
		onUpdateEntrySlug: (entry: SiteEntry, slug: string) => void;
		onDeleteEntry: (entry: SiteEntry) => void;
		onUploadImage: (entry: Extract<SiteEntry, { kind: 'gallery' }>, file: File, meta: UploadMeta) => Promise<void> | void;
		onUpdateGalleryImage: (entry: Extract<SiteEntry, { kind: 'gallery' }>, index: number, patch: Partial<ImageAsset>) => void;
		onDeleteGalleryImage: (entry: Extract<SiteEntry, { kind: 'gallery' }>, index: number, image: ImageAsset) => void;
	};

	let {
		activeType,
		snapshot,
		selectedPage,
		selectedCollection,
		selectedEntry,
		onUpdateSiteField,
		onUpdateNavigationItem,
		onAddNavigationItem,
		onMoveNavigationItem,
		onRemoveNavigationItem,
		onUpdatePageField,
		onUpdateContactField,
		onUpdatePageSlug,
		onDeletePage,
		onUpdateCollectionField,
		onUpdateCollectionSlug,
		onUpdateCollectionRouteBase,
		onUpdateCollectionKind,
		onDeleteCollection,
		onUpdateEntryField,
		onUpdateEntrySlug,
		onDeleteEntry,
		onUploadImage,
		onUpdateGalleryImage,
		onDeleteGalleryImage
	}: Props = $props();

	const transitionKey = $derived(
		activeType === 'page' && selectedPage
			? `page:${selectedPage.slug}`
			: activeType === 'collection' && selectedCollection
				? `collection:${selectedCollection.slug}`
				: activeType === 'entry' && selectedEntry
					? `entry:${selectedEntry.collectionSlug}:${selectedEntry.slug}`
					: 'site'
	);
</script>

{#key transitionKey}
	<div class="editor-transition" in:fade={{ duration: 260, easing: cubicOut }}>
		{#if activeType === 'site'}
			<AdminSiteEditor
				{snapshot}
				onAddNavigationItem={onAddNavigationItem}
				onMoveNavigationItem={onMoveNavigationItem}
				onRemoveNavigationItem={onRemoveNavigationItem}
				onUpdateNavigationItem={onUpdateNavigationItem}
				onUpdateSiteField={onUpdateSiteField}
			/>
		{:else if activeType === 'page' && selectedPage}
			<AdminPageEditor
				contact={snapshot.site.contact}
				page={selectedPage}
				onDelete={() => onDeletePage(selectedPage)}
				onUpdateContactField={onUpdateContactField}
				onUpdateField={(field, value) => onUpdatePageField(selectedPage, field, value)}
				onUpdateSlug={(slug) => onUpdatePageSlug(selectedPage, slug)}
			/>
		{:else if activeType === 'collection' && selectedCollection}
			<AdminCollectionEditor
				collection={selectedCollection}
				onDelete={() => onDeleteCollection(selectedCollection)}
				onUpdateField={(field, value) => onUpdateCollectionField(selectedCollection, field, value)}
				onUpdateKind={(kind) => onUpdateCollectionKind(selectedCollection, kind)}
				onUpdateRouteBase={(value) => onUpdateCollectionRouteBase(selectedCollection, value)}
				onUpdateSlug={(slug) => onUpdateCollectionSlug(selectedCollection, slug)}
			/>
		{:else if activeType === 'entry' && selectedEntry && selectedCollection}
			<AdminEntryEditor
				collection={selectedCollection}
				entry={selectedEntry}
				onDelete={() => onDeleteEntry(selectedEntry)}
				onDeleteImage={(index, image) =>
					selectedEntry.kind === 'gallery' ? onDeleteGalleryImage(selectedEntry, index, image) : undefined}
				onUpdateField={(patch) => onUpdateEntryField(selectedEntry, patch)}
				onUpdateGalleryImage={(index, patch) =>
					selectedEntry.kind === 'gallery' ? onUpdateGalleryImage(selectedEntry, index, patch) : undefined}
				onUpdateSlug={(slug) => onUpdateEntrySlug(selectedEntry, slug)}
				onUpload={(file, meta) =>
					selectedEntry.kind === 'gallery' ? onUploadImage(selectedEntry, file, meta) : undefined}
			/>
		{/if}
	</div>
{/key}

<style>
	.editor-transition {
		height: 100%;
	}
</style>
