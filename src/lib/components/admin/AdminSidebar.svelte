<script lang="ts">
	import { LogOut } from '@lucide/svelte';
	import AccordionPanel from '$lib/components/admin/AccordionPanel.svelte';
	import AdminNewButton from '$lib/components/admin/AdminNewButton.svelte';
	import type { AdminViewType, CollectionGroup } from '$lib/components/admin/types';
	import type { SiteCollection, SitePage } from '$lib/types/content';

	type Props = {
		siteName: string;
		pages: SitePage[];
		collectionGroups: CollectionGroup[];
		activeType: AdminViewType;
		activeSlug: string;
		activeCollectionSlug?: string;
		onChoose: (type: AdminViewType, slug: string, collectionSlug?: string) => void;
		onCreatePage: () => void;
		onCreateCollection: () => void;
		onCreateEntry: (collection: SiteCollection) => void;
		onLogout: () => void;
	};

	let {
		siteName,
		pages,
		collectionGroups,
		activeType,
		activeSlug,
		activeCollectionSlug,
		onChoose,
		onCreatePage,
		onCreateCollection,
		onCreateEntry,
		onLogout
	}: Props = $props();

	let expandedCollectionSlug = $state<string | undefined>(undefined);

	$effect(() => {
		if (activeType === 'collection' && activeSlug) {
			expandedCollectionSlug = activeSlug;
			return;
		}

		if (activeCollectionSlug) {
			expandedCollectionSlug = activeCollectionSlug;
		}
	});

	function isActive(type: AdminViewType, slug: string, collectionSlug?: string) {
		return activeType === type && activeSlug === slug && activeCollectionSlug === collectionSlug;
	}

	function handleChooseCollection(collection: SiteCollection) {
		expandedCollectionSlug = collection.slug;
		onChoose('collection', collection.slug);
	}
</script>

<aside class="sidebar">
	<div class="sidebar-head">
		<div>
			<p class="eyebrow">CMS</p>
			<h1>{siteName}</h1>
		</div>
	</div>

	<nav class="nav-list" aria-label="CMS sections">
		<button
			aria-label="Site Settings"
			class:active={isActive('site', 'site')}
			class="nav-root-item"
			onclick={() => onChoose('site', 'site')}
			type="button"
		>
			<span>Site Settings</span>
		</button>

		<section class="nav-group">
			<div class="nav-group-head">
				<h2>Pages</h2>
				<AdminNewButton ariaLabel="Create new page" onclick={onCreatePage} />
			</div>
			<div class="nav-items">
				{#each pages as page}
					<button
						class:active={isActive('page', page.slug)}
						class="nav-item"
						aria-label={page.title}
						onclick={() => onChoose('page', page.slug)}
						type="button"
					>
						<span>{page.title}</span>
					</button>
				{/each}
			</div>
		</section>

		<section class="nav-group">
			<div class="nav-group-head">
				<h2>Collections</h2>
				<AdminNewButton ariaLabel="Create new collection" onclick={onCreateCollection} />
			</div>
			<div class="nav-items collection-nav">
				{#each collectionGroups as group}
					<AccordionPanel
						className="collection-accordion"
						open={
							isActive('collection', group.collection.slug) ||
							activeCollectionSlug === group.collection.slug ||
							expandedCollectionSlug === group.collection.slug
						}
						onSummaryClick={() => handleChooseCollection(group.collection)}
					>
						{#snippet summaryContent()}
							<span
								class:active={isActive('collection', group.collection.slug)}
								class="collection-summary"
							>
								{group.collection.title}
							</span>
						{/snippet}
						{#snippet actions()}
							<AdminNewButton
								ariaLabel={`Create new entry in ${group.collection.title}`}
								className="entry-add"
								onclick={(event) => {
									event.stopPropagation();
									onCreateEntry(group.collection);
								}}
							/>
						{/snippet}
						<div class="entry-list">
							{#each group.entries as entry}
								<button
									class:active={isActive('entry', entry.slug, group.collection.slug)}
									class="nav-item entry-item"
									onclick={() => onChoose('entry', entry.slug, group.collection.slug)}
									type="button"
								>
									<span>{entry.title}</span>
								</button>
							{/each}
						</div>
					</AccordionPanel>
				{/each}
			</div>
		</section>
	</nav>

	<div class="sidebar-foot">
		<button class="ghost small logout-button" onclick={onLogout} type="button">
			Log Out
			<LogOut aria-hidden="true" size={16} strokeWidth={2} />
		</button>
	</div>
</aside>

<style>
	.sidebar {
		height: 100vh;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr) auto;
		align-content: start;
		overflow: hidden;
		padding: 1.4rem;
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(14px);
		border-top: 0;
		border-bottom: 0;
		border-left: 0;
		border-right: 1px solid #d9deea;
		border-radius: 0;
		box-shadow: 0 30px 80px rgba(25, 39, 58, 0.12);
	}

	.sidebar-head {
		display: flex;
		align-items: start;
		gap: 1rem;
	}

	.sidebar-head h1,
	.nav-group-head h2 {
		margin: 0;
		font-family: Georgia, serif;
	}

	.eyebrow {
		color: #617086;
	}

	.eyebrow {
		margin: 0 0 0.35rem;
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: #5d6f8a;
	}

	.nav-list,
	.nav-items,
	.entry-list {
		display: grid;
	}

	.nav-list {
		align-content: start;
		gap: 1rem;
		min-height: 0;
		overflow: auto;
		padding-right: 0.25rem;
	}

	.sidebar-foot {
		padding-top: 1rem;
		border-top: 1px solid #d9deea;
	}

	.nav-group {
		display: grid;
		gap: 0.7rem;
	}

	.collection-nav {
		gap: 1rem;
	}

	.nav-group-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.nav-root-item,
	.nav-item {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		text-align: left;
		background: transparent;
		border: 1px solid transparent;
		color: #223042;
		padding: 0.65rem 0.8rem;
		border-radius: 14px;
		font: inherit;
	}

	.nav-root-item.active,
	.nav-item.active {
		background: #eef4ff;
		border-color: #c9d8f4;
	}

	.entry-list {
		gap: 0.35rem;
		padding-left: 1rem;
	}

	.entry-item {
		font-size: 0.93rem;
	}

	.collection-summary {
		display: inline-flex;
		align-items: center;
		min-height: 2rem;
		padding-inline: 0.15rem;
		border-radius: 12px;
		color: #223042;
	}

	.collection-summary.active {
		background: #eef4ff;
		box-shadow: inset 0 0 0 1px #c9d8f4;
		padding-inline: 0.8rem;
	}

	:global(.collection-accordion .accordion) {
		border-top: 0;
		padding-top: 0;
	}

	:global(.collection-accordion .actions) {
		padding-top: 0.2rem;
	}

	:global(.collection-accordion summary) {
		min-height: 2.5rem;
	}

	button {
		cursor: pointer;
	}

	button.ghost {
		background: white;
		color: #1f3046;
		border: 1px solid #cfd8e7;
	}

	button.small {
		padding: 0.42rem 0.72rem;
		font-size: 0.84rem;
		white-space: nowrap;
	}

	button.logout-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		border-radius: 999px;
		font: inherit;
		width: 100%;
	}

	:global(.entry-add) {
		flex-shrink: 0;
	}
</style>
