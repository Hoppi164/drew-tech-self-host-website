<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import type { SiteCollection } from '$lib/types/content';
	import type { EntryKind } from '$lib/types/content';
	import { themeKeys, themes } from '$lib/types/theme';
	import { createDebouncedCallback } from '$lib/utils/debounce';

	type Props = {
		collection: SiteCollection;
		onUpdateField: <K extends keyof SiteCollection>(field: K, value: SiteCollection[K]) => void;
		onUpdateSlug: (slug: string) => void;
		onUpdateRouteBase: (value: string) => void;
		onUpdateKind: (kind: EntryKind) => void;
		onDelete: () => void;
	};

	let { collection, onUpdateField, onUpdateSlug, onUpdateRouteBase, onUpdateKind, onDelete }: Props =
		$props();
	let slugDraft = $state(untrack(() => collection.slug));
	let committedSlug = $state(untrack(() => collection.slug));

	function themeValueFromInput(value: string) {
		return (value || undefined) as (typeof themeKeys)[number] | undefined;
	}

	const debouncedSlugCommit = createDebouncedCallback((nextSlug: string) => {
		committedSlug = nextSlug;
		onUpdateSlug(nextSlug);
	}, 850);

	$effect(() => {
		if (collection.slug !== committedSlug) {
			committedSlug = collection.slug;
			slugDraft = collection.slug;
		}
	});

	function handleSlugInput(event: Event) {
		const nextSlug = (event.currentTarget as HTMLInputElement).value;
		slugDraft = nextSlug;
		debouncedSlugCommit.schedule(nextSlug);
	}

	function flushSlugCommit() {
		if (slugDraft === committedSlug) {
			debouncedSlugCommit.cancel();
			return;
		}

		committedSlug = slugDraft;
		debouncedSlugCommit.flush(slugDraft);
	}

	onDestroy(() => {
		debouncedSlugCommit.cancel();
	});
</script>

<div class="panel">
	<div class="panel-scroll">
		<h3>Collection Editor</h3>
		<label>Title <input value={collection.title} oninput={(event) => onUpdateField('title', (event.currentTarget as HTMLInputElement).value)} /></label>
		<label>Slug <input onblur={flushSlugCommit} oninput={handleSlugInput} value={slugDraft} /></label>
		<label>Route Base <input value={collection.routeBase} oninput={(event) => onUpdateRouteBase((event.currentTarget as HTMLInputElement).value)} /></label>
		<label>Description <textarea oninput={(event) => onUpdateField('description', (event.currentTarget as HTMLTextAreaElement).value)}>{collection.description}</textarea></label>
		<label>Collection Theme
			<select value={collection.theme ?? ''} onchange={(event) => onUpdateField('theme', themeValueFromInput((event.currentTarget as HTMLSelectElement).value))}>
				<option value="">Use global theme</option>
				{#each themeKeys as key}
					<option value={key}>{themes[key].name}</option>
				{/each}
			</select>
		</label>
		<label>Entry Kind
			<select value={collection.kind} onchange={(event) => onUpdateKind((event.currentTarget as HTMLSelectElement).value as EntryKind)}>
				<option value="article">Article</option>
				<option value="event">Event</option>
				<option value="gallery">Gallery</option>
			</select>
		</label>
		<label>Layout
			<select value={collection.layout} onchange={(event) => onUpdateField('layout', (event.currentTarget as HTMLSelectElement).value as SiteCollection['layout'])}>
				<option value="cards">Cards</option>
				<option value="list">List</option>
				<option value="timeline">Timeline</option>
				<option value="gallery">Gallery</option>
			</select>
		</label>
		<div class="checkbox-grid">
			<label><input checked={collection.showDate} onchange={(event) => onUpdateField('showDate', (event.currentTarget as HTMLInputElement).checked)} type="checkbox" /> Show date</label>
			<label><input checked={collection.showExcerpt} onchange={(event) => onUpdateField('showExcerpt', (event.currentTarget as HTMLInputElement).checked)} type="checkbox" /> Show excerpt</label>
			<label><input checked={collection.showFeaturedImage} onchange={(event) => onUpdateField('showFeaturedImage', (event.currentTarget as HTMLInputElement).checked)} type="checkbox" /> Show featured image</label>
			<label><input checked={collection.showImageGrid} onchange={(event) => onUpdateField('showImageGrid', (event.currentTarget as HTMLInputElement).checked)} type="checkbox" /> Show image grid</label>
			<label><input checked={collection.showBodyPreview} onchange={(event) => onUpdateField('showBodyPreview', (event.currentTarget as HTMLInputElement).checked)} type="checkbox" /> Show body</label>
		</div>
		<button class="danger" onclick={onDelete} type="button">Delete Collection</button>
	</div>
</div>

<style>
	.panel,
	.checkbox-grid {
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

	.panel h3 {
		margin: 0;
		font-family: Georgia, serif;
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

	.checkbox-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.6rem 1rem;
	}

	.checkbox-grid label {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		margin: 0;
		font-weight: 500;
	}

	.checkbox-grid input {
		padding: 0;
		width: auto;
	}

	button.danger {
		border: 1px solid #efc7cd;
		border-radius: 999px;
		padding: 0.85rem 1.15rem;
		background: #fff1f1;
		color: #8f1f2c;
		cursor: pointer;
	}
</style>
