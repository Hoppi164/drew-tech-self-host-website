<script lang="ts">
	import AdminNewButton from '$lib/components/admin/AdminNewButton.svelte';
	import type { SiteSnapshot } from '$lib/types/content';
	import { themeKeys, themes } from '$lib/types/theme';

	type Props = {
		snapshot: SiteSnapshot;
		onUpdateSiteField: (path: string, value: string) => void;
		onUpdateNavigationItem: (index: number, field: 'label' | 'path', value: string) => void;
		onAddNavigationItem: () => void;
		onMoveNavigationItem: (index: number, direction: -1 | 1) => void;
		onRemoveNavigationItem: (index: number) => void;
	};

	let {
		snapshot,
		onUpdateSiteField,
		onUpdateNavigationItem,
		onAddNavigationItem,
		onMoveNavigationItem,
		onRemoveNavigationItem
	}: Props = $props();
</script>

<div class="panel">
	<div class="panel-scroll">
		<h3>Brand, Repo, and Theme</h3>
		<label>Business Name <input value={snapshot.site.business.name} oninput={(event) => onUpdateSiteField('business.name', (event.currentTarget as HTMLInputElement).value)} /></label>
		<label>Tagline <input value={snapshot.site.business.tagline} oninput={(event) => onUpdateSiteField('business.tagline', (event.currentTarget as HTMLInputElement).value)} /></label>
		<label>Description <textarea oninput={(event) => onUpdateSiteField('business.description', (event.currentTarget as HTMLTextAreaElement).value)}>{snapshot.site.business.description}</textarea></label>
		<label>GitHub Owner <input value={snapshot.site.repo.owner} oninput={(event) => onUpdateSiteField('repo.owner', (event.currentTarget as HTMLInputElement).value)} /></label>
		<label>Repository Name <input value={snapshot.site.repo.name} oninput={(event) => onUpdateSiteField('repo.name', (event.currentTarget as HTMLInputElement).value)} /></label>
		<label>Base Path <input value={snapshot.site.repo.basePath} oninput={(event) => onUpdateSiteField('repo.basePath', (event.currentTarget as HTMLInputElement).value)} placeholder='"" for root, "/gardening" for subpath' /></label>
		<label>Home Page
			<select value={snapshot.site.homepage.homePageSlug} onchange={(event) => onUpdateSiteField('homepage.homePageSlug', (event.currentTarget as HTMLSelectElement).value)}>
				{#each snapshot.pages as page}
					<option value={page.slug}>{page.title}</option>
				{/each}
			</select>
		</label>
		<label>Global Theme
			<select value={snapshot.site.theme.global} onchange={(event) => onUpdateSiteField('theme.global', (event.currentTarget as HTMLSelectElement).value)}>
				{#each themeKeys as key}
					<option value={key}>{themes[key].name}</option>
				{/each}
			</select>
		</label>

		<div class="subpanel">
			<div class="subpanel-head">
				<h4>Navigation</h4>
				<AdminNewButton ariaLabel="Create new navigation link" onclick={onAddNavigationItem} />
			</div>
			<div class="nav-editor-list">
				{#each snapshot.site.navigation as item, index}
					<div class="nav-editor-row">
						<label>Label <input value={item.label} oninput={(event) => onUpdateNavigationItem(index, 'label', (event.currentTarget as HTMLInputElement).value)} /></label>
						<label>Path <input value={item.path} oninput={(event) => onUpdateNavigationItem(index, 'path', (event.currentTarget as HTMLInputElement).value)} /></label>
						<div class="nav-editor-actions">
							<button class="ghost small" onclick={() => onMoveNavigationItem(index, -1)} type="button" disabled={index === 0}>Up</button>
							<button class="ghost small" onclick={() => onMoveNavigationItem(index, 1)} type="button" disabled={index === snapshot.site.navigation.length - 1}>Down</button>
							<button class="danger small" onclick={() => onRemoveNavigationItem(index)} type="button">Remove</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.panel,
	.subpanel,
	.nav-editor-list {
		display: grid;
	}

	.panel {
		height: 100%;
		box-sizing: border-box;
		overflow: hidden;
		padding: 0.35rem 0.35rem 0.35rem 0;
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(14px);
		border: 1px solid #d9deea;
		border-left: 0;
		border-radius: 0 30px 30px 0;
		box-shadow: 0 30px 80px rgba(25, 39, 58, 0.12);
	}

	.panel-scroll {
		display: grid;
		align-content: start;
		gap: 0.9rem;
		height: 100%;
		overflow: auto;
		scrollbar-gutter: stable;
		padding: 1.25rem;
	}

	.panel h3,
	.subpanel-head h4 {
		margin: 0;
		font-family: Georgia, serif;
	}

	.subpanel {
		gap: 0.9rem;
		padding-top: 0.5rem;
		border-top: 1px solid #dce4f1;
	}

	.subpanel-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.nav-editor-list {
		gap: 0.8rem;
	}

	.nav-editor-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
		gap: 0.75rem;
		align-items: end;
		padding: 0.9rem;
		border: 1px solid #dce4f1;
		border-radius: 18px;
		background: #fbfdff;
	}

	.nav-editor-actions {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
	}

	label {
		display: grid;
		gap: 0.35rem;
		margin-bottom: 0.9rem;
		font-weight: 600;
	}

	input,
	textarea,
	select,
	button {
		font: inherit;
	}

	input,
	textarea,
	select {
		padding: 0.85rem 0.95rem;
		border-radius: 16px;
		border: 1px solid #cfd8e7;
		background: white;
		color: #1c2430;
	}

	textarea {
		min-height: 100px;
		resize: vertical;
	}

	button.danger {
		background: #fff1f1;
		color: #8f1f2c;
		border: 1px solid #efc7cd;
	}

	button.small {
		padding: 0.42rem 0.72rem;
		font-size: 0.84rem;
		white-space: nowrap;
		border-radius: 999px;
		cursor: pointer;
		background: white;
		color: #1f3046;
		border: 1px solid #cfd8e7;
	}

	@media (max-width: 1080px) {
		.nav-editor-row {
			grid-template-columns: 1fr;
		}
	}
</style>
