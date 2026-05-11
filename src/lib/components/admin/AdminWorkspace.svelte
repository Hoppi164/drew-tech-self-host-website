<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { untrack } from 'svelte';
	import AdminEditorPane from '$lib/components/admin/AdminEditorPane.svelte';
	import AdminLoginPage from '$lib/components/admin/AdminLoginPage.svelte';
	import AdminPreviewPane from '$lib/components/admin/AdminPreviewPane.svelte';
	import AdminSidebar from '$lib/components/admin/AdminSidebar.svelte';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import {
		createGithubLinks,
		lockAdminSession,
		unlockAdminSession
	} from '$lib/components/admin/workspace/auth';
	import { getConfirmCopy } from '$lib/components/admin/workspace/confirm';
	import {
		clearPendingDeletePath,
		createPendingUpload,
		deleteGalleryImageWorkflow,
		queueDeletePath,
		queueDeletePaths,
		queuePendingUpload
	} from '$lib/components/admin/workspace/media';
	import { publishAdminSnapshot } from '$lib/components/admin/workspace/publish';
	import {
		addNavigationItem as addNavigationItemToSnapshot,
		changeCollectionKindSnapshot,
		cloneSnapshot,
		createCollectionSnapshot,
		createEntrySnapshot,
		createPageSnapshot,
		moveNavigationItem as moveNavigationItemInSnapshot,
		removeCollectionSnapshot,
		removeEntrySnapshot,
		removeNavigationItem as removeNavigationItemFromSnapshot,
		removePageSnapshot,
		renameCollectionSnapshot,
		renameEntrySnapshot,
		renamePageSnapshot,
		setSiteField,
		updateCollectionRouteBaseSnapshot,
		updateGalleryImageSnapshot,
		updateNavigationItem as updateNavigationItemInSnapshot,
		upsertEntitySnapshot
	} from '$lib/components/admin/workspace/snapshot';
	import type {
		AdminViewType,
		ConfirmState,
		GithubLinks,
		PreviewSelection,
		UploadMeta
	} from '$lib/components/admin/types';
	import {
		getEntriesForCollection,
		normalizeRouteBase,
		updateRenderedBody
	} from '$lib/content/site';
	import { adminSelection, adminSnapshot } from '$lib/stores/admin';
	import {
		type EditableEntityType,
		type ImageAsset,
		type SiteCollection,
		type SiteEntry,
		type SiteGalleryEntry,
		type SitePage,
		type SiteSnapshot
	} from '$lib/types/content';

	type Props = {
		initialSnapshot: SiteSnapshot;
	};

	let { initialSnapshot }: Props = $props();
	let draftSnapshot = $state<SiteSnapshot>(untrack(() => cloneSnapshot(initialSnapshot)));
	let token = $state('');
	let status = $state('');
	let error = $state('');
	let unlocked = $state(false);
	let activeType = $state<AdminViewType>('site');
	let activeSlug = $state('site');
	let activeCollectionSlug = $state<string | undefined>(undefined);
	let confirmDialogOpen = $state(false);
	let confirmState = $state<ConfirmState | null>(null);

	$effect(() => {
		adminSnapshot.set(draftSnapshot);
	});

	const repo = $derived({
		owner: draftSnapshot.site.repo.owner,
		name: draftSnapshot.site.repo.name,
		branch: draftSnapshot.site.repo.branch
	});

	const githubLinks = $derived<GithubLinks>(createGithubLinks(repo));

	const selectedPage = $derived(draftSnapshot.pages.find((page) => page.slug === activeSlug));
	const selectedCollection = $derived(
		activeType === 'collection' || activeType === 'entry'
			? draftSnapshot.collections.find(
					(collection) => collection.slug === (activeType === 'collection' ? activeSlug : activeCollectionSlug)
				)
			: undefined
	);
	const selectedEntry = $derived(
		activeType === 'entry' && activeCollectionSlug
			? draftSnapshot.entries.find(
					(entry) => entry.collectionSlug === activeCollectionSlug && entry.slug === activeSlug
				)
			: undefined
	);

	const collectionGroups = $derived(
		draftSnapshot.collections.map((collection) => ({
			collection,
			entries: getEntriesForCollection(draftSnapshot, collection.slug)
		}))
	);

	function choose(type: EditableEntityType | 'site', slug: string, collectionSlug?: string) {
		activeType = type;
		activeSlug = slug;
		activeCollectionSlug = collectionSlug;
		adminSelection.set({ type, slug, collectionSlug });
	}

	function choosePreview(selection: PreviewSelection) {
		choose(selection.type, selection.slug, selection.collectionSlug);
	}

	function updateSiteField(path: string, value: string) {
		draftSnapshot = setSiteField(draftSnapshot, path, value);
	}

	function updateNavigationItem(index: number, field: 'label' | 'path', value: string) {
		draftSnapshot = updateNavigationItemInSnapshot(draftSnapshot, index, field, value);
	}

	function addNavigationItem() {
		draftSnapshot = addNavigationItemToSnapshot(draftSnapshot);
	}

	function moveNavigationItem(index: number, direction: -1 | 1) {
		draftSnapshot = moveNavigationItemInSnapshot(draftSnapshot, index, direction);
	}

	function removeNavigationItem(index: number) {
		draftSnapshot = removeNavigationItemFromSnapshot(draftSnapshot, index);
	}

	function upsertEntity(type: EditableEntityType, entity: SitePage | SiteCollection | SiteEntry) {
		clearPendingDeletePath(entity.sourcePath);
		draftSnapshot = upsertEntitySnapshot(draftSnapshot, type, entity);
	}

	function createPage() {
		const { page, snapshot } = createPageSnapshot(draftSnapshot);
		draftSnapshot = snapshot;
		choose('page', page.slug);
	}

	function createCollection() {
		const { collection, snapshot } = createCollectionSnapshot(draftSnapshot);
		draftSnapshot = snapshot;
		choose('collection', collection.slug);
	}

	function createEntry(collection: SiteCollection) {
		const { entry, snapshot } = createEntrySnapshot(draftSnapshot, collection);
		draftSnapshot = snapshot;
		choose('entry', entry.slug, collection.slug);
	}

	async function unlock() {
		error = '';
		status = '';
		const result = await unlockAdminSession(token, repo);
		if (result.ok) {
			unlocked = true;
			status = '';
			return;
		}
		error = result.error;
	}

	function lockAdmin() {
		const next = lockAdminSession();
		unlocked = next.unlocked;
		token = next.token;
		status = next.status;
		error = next.error;
	}

	function updatePageField<K extends keyof SitePage>(page: SitePage, field: K, value: SitePage[K]) {
		const next = updateRenderedBody({ ...page, [field]: value });
		upsertEntity('page', next);
	}

	function updateContactField(field: keyof SiteSnapshot['site']['contact'], value: string) {
		updateSiteField(`contact.${field}`, value);
	}

	function updatePageSlug(page: SitePage, slug: string) {
		const { slug: nextSlug, snapshot } = renamePageSnapshot(draftSnapshot, page, slug);
		draftSnapshot = snapshot;
		choose('page', nextSlug);
	}

	function updateCollectionField<K extends keyof SiteCollection>(
		collection: SiteCollection,
		field: K,
		value: SiteCollection[K]
	) {
		upsertEntity('collection', { ...collection, [field]: value });
	}

	function updateCollectionRouteBase(collection: SiteCollection, value: string) {
		draftSnapshot = updateCollectionRouteBaseSnapshot(
			draftSnapshot,
			collection,
			normalizeRouteBase(value)
		).snapshot;
	}

	function updateCollectionSlug(collection: SiteCollection, slug: string) {
		const { slug: nextSlug, snapshot } = renameCollectionSnapshot(draftSnapshot, collection, slug);
		draftSnapshot = snapshot;
		choose('collection', nextSlug);
	}

	function updateCollectionKind(collection: SiteCollection, kind: SiteCollection['kind']) {
		draftSnapshot = changeCollectionKindSnapshot(draftSnapshot, collection, kind);
	}

	function updateEntryField(entry: SiteEntry, patch: Partial<SiteEntry>) {
		const next = updateRenderedBody({ ...entry, ...patch } as SiteEntry);
		upsertEntity('entry', next);
	}

	function updateEntrySlug(entry: SiteEntry, slug: string) {
		const { slug: nextSlug, snapshot } = renameEntrySnapshot(draftSnapshot, entry, slug);
		draftSnapshot = snapshot;
		choose('entry', nextSlug, entry.collectionSlug);
	}

	function updateGalleryImage(entry: SiteGalleryEntry, index: number, patch: Partial<ImageAsset>) {
		updateEntryField(entry, updateGalleryImageSnapshot(entry, index, patch));
	}

	async function handleUpload(entry: SiteGalleryEntry, file: File, meta: UploadMeta) {
		const { upload, item } = await createPendingUpload(file, meta);
		queuePendingUpload(upload);
		updateEntryField(entry, {
			featuredImage: entry.featuredImage || item.src,
			images: [...entry.images, item]
		});
	}

	function promptDelete(state: ConfirmState) {
		confirmState = state;
		confirmDialogOpen = true;
	}

	function deletePage(page: SitePage) {
		const { fallbackPage, snapshot } = removePageSnapshot(draftSnapshot, page);
		queueDeletePath(page.sourcePath);
		draftSnapshot = snapshot;
		choose(fallbackPage ? 'page' : 'site', fallbackPage?.slug ?? 'site');
	}

	function deleteCollection(collection: SiteCollection) {
		const { deletePaths, snapshot } = removeCollectionSnapshot(draftSnapshot, collection);
		queueDeletePaths(deletePaths);
		draftSnapshot = snapshot;
		choose('site', 'site');
	}

	function deleteEntry(entry: SiteEntry) {
		const { deletePaths, snapshot } = removeEntrySnapshot(draftSnapshot, entry);
		queueDeletePaths(deletePaths);
		draftSnapshot = snapshot;
		choose('collection', entry.collectionSlug);
	}

	function deleteGalleryImage(entry: SiteGalleryEntry, index: number) {
		updateEntryField(entry, deleteGalleryImageWorkflow(entry, index));
	}

	function confirmDelete() {
		if (!confirmState) return;
		switch (confirmState.kind) {
			case 'page':
				deletePage(confirmState.page);
				break;
			case 'collection':
				deleteCollection(confirmState.collection);
				break;
			case 'entry':
				deleteEntry(confirmState.entry);
				break;
			case 'image':
				deleteGalleryImage(confirmState.entry, confirmState.index);
				break;
		}
		confirmState = null;
	}

	function resetConfirm() {
		confirmState = null;
	}

	async function publish() {
		error = '';
		status = 'Publishing changes to GitHub...';
		const result = await publishAdminSnapshot(repo, draftSnapshot);
		if (result.ok) {
			status = result.status;
			return;
		}
		error = result.error;
	}

	function openPreview() {
		goto(
			`${base}/admin/preview?type=${activeType}&slug=${activeSlug}${activeCollectionSlug ? `&collectionSlug=${activeCollectionSlug}` : ''}`
		);
	}
</script>

{#if !unlocked}
	<AdminLoginPage
		{error}
		{githubLinks}
		{status}
		{token}
		onSubmit={unlock}
		onTokenChange={(value) => (token = value)}
	/>
{:else}
	<div class="workspace-shell">
		<AdminSidebar
			activeCollectionSlug={activeCollectionSlug}
			activeSlug={activeSlug}
			activeType={activeType}
			collectionGroups={collectionGroups}
			onChoose={choose}
			onCreateCollection={createCollection}
			onCreateEntry={createEntry}
			onCreatePage={createPage}
			onLogout={lockAdmin}
			pages={draftSnapshot.pages}
			siteName={draftSnapshot.site.business.name}
		/>

		<section class="workspace">
			<div class="workspace-grid">
				<section class="editor">
					<AdminEditorPane
						activeType={activeType}
						onAddNavigationItem={addNavigationItem}
						onDeleteCollection={(collection) => promptDelete({ kind: 'collection', collection })}
						onDeleteEntry={(entry) => promptDelete({ kind: 'entry', entry })}
						onDeleteGalleryImage={(entry, index, image) =>
							promptDelete({ kind: 'image', entry, index, image })}
						onDeletePage={(page) => promptDelete({ kind: 'page', page })}
						onMoveNavigationItem={moveNavigationItem}
						onRemoveNavigationItem={removeNavigationItem}
						onUpdateCollectionField={updateCollectionField}
						onUpdateCollectionKind={updateCollectionKind}
						onUpdateCollectionRouteBase={updateCollectionRouteBase}
						onUpdateCollectionSlug={updateCollectionSlug}
						onUpdateEntryField={updateEntryField}
						onUpdateEntrySlug={updateEntrySlug}
						onUpdateGalleryImage={updateGalleryImage}
						onUpdateNavigationItem={updateNavigationItem}
						onUpdatePageField={updatePageField}
						onUpdateContactField={updateContactField}
						onUpdatePageSlug={updatePageSlug}
						onUpdateSiteField={updateSiteField}
						onUploadImage={handleUpload}
						selectedCollection={selectedCollection}
						selectedEntry={selectedEntry}
						selectedPage={selectedPage}
						snapshot={draftSnapshot}
					/>
				</section>

				<AdminPreviewPane
					collectionSlug={activeCollectionSlug}
					{error}
					onNavigatePreview={choosePreview}
					onOpenPreview={openPreview}
					onPublish={publish}
					slug={activeSlug}
					snapshot={draftSnapshot}
					{status}
					type={activeType}
				/>
			</div>
		</section>
	</div>

	<ConfirmDialog
		bind:open={confirmDialogOpen}
		cancelLabel="Cancel"
		confirmLabel={getConfirmCopy(confirmState).confirmLabel}
		description={getConfirmCopy(confirmState).description}
		onclose={resetConfirm}
		onconfirm={confirmDelete}
		title={getConfirmCopy(confirmState).title}
		tone="danger"
	/>
{/if}

<style>
	.workspace-shell {
		height: 100vh;
		display: grid;
		grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
		gap: 0;
		overflow: hidden;
		background:
			radial-gradient(circle at top left, rgba(90, 132, 210, 0.14), transparent 35%),
			linear-gradient(180deg, #f8fbff 0%, #eef3f8 100%);
	}

	.workspace {
		min-width: 0;
		min-height: 0;
		padding: 0;
		overflow: hidden;
	}

	.workspace-grid {
		display: grid;
		grid-template-columns: minmax(340px, 440px) minmax(0, 1fr);
		align-items: stretch;
		gap: 1rem;
		height: 100%;
		min-height: 0;
		overflow: hidden;
	}

	.editor {
		min-width: 0;
		min-height: 0;
		height: 100%;
		overflow: hidden;
	}

	@media (max-width: 1080px) {
		.workspace-shell,
		.workspace-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
