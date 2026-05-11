<script lang="ts">
	import AdminInputToggleField from '$lib/components/admin/AdminInputToggleField.svelte';
	import { onDestroy, untrack } from 'svelte';
	import type { UploadMeta } from '$lib/components/admin/types';
	import type { ImageAsset, SiteCollection, SiteEntry, SiteGalleryEntry } from '$lib/types/content';
	import { themeKeys, themes } from '$lib/types/theme';
	import { createDebouncedCallback } from '$lib/utils/debounce';

	type Props = {
		entry: SiteEntry;
		collection: SiteCollection;
		onUpdateField: (patch: Partial<SiteEntry>) => void;
		onUpdateSlug: (slug: string) => void;
		onDelete: () => void;
		onUpload: (file: File, meta: UploadMeta) => Promise<void> | void;
		onUpdateGalleryImage: (index: number, patch: Partial<ImageAsset>) => void;
		onDeleteImage: (index: number, image: ImageAsset) => void;
	};

	let {
		entry,
		collection,
		onUpdateField,
		onUpdateSlug,
		onDelete,
		onUpload,
		onUpdateGalleryImage,
		onDeleteImage
	}: Props = $props();

	let uploadAlt = $state('');
	let uploadCaption = $state('');
	let uploadTags = $state('');
	let uploadAttribution = $state('');
	let slugDraft = $state(untrack(() => entry.slug));
	let committedSlug = $state(untrack(() => entry.slug));

	function themeValueFromInput(value: string) {
		return (value || undefined) as (typeof themeKeys)[number] | undefined;
	}

	const debouncedSlugCommit = createDebouncedCallback((nextSlug: string) => {
		committedSlug = nextSlug;
		onUpdateSlug(nextSlug);
	}, 850);

	$effect(() => {
		if (entry.slug !== committedSlug) {
			committedSlug = entry.slug;
			slugDraft = entry.slug;
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

	async function handleUploadChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file || entry.kind !== 'gallery') return;

		await onUpload(file, {
			alt: uploadAlt || file.name,
			caption: uploadCaption,
			tags: uploadTags
				.split(',')
				.map((tag) => tag.trim())
				.filter(Boolean),
			attribution: uploadAttribution
		});

		uploadAlt = '';
		uploadCaption = '';
		uploadTags = '';
		uploadAttribution = '';
		input.value = '';
	}

	onDestroy(() => {
		debouncedSlugCommit.cancel();
	});
</script>

<div class="panel">
	<div class="panel-scroll">
		<h3>{collection.kind === 'gallery' ? 'Gallery Entry' : collection.kind === 'event' ? 'Event Entry' : 'Article Entry'}</h3>
		<AdminInputToggleField
			checked={entry.showTitle}
			label="Title"
			toggleLabel="Show entry title"
			value={entry.title}
			onInput={(value) => onUpdateField({ title: value })}
			onToggle={(checked) => onUpdateField({ showTitle: checked })}
		/>
		<label>Slug <input onblur={flushSlugCommit} oninput={handleSlugInput} value={slugDraft} /></label>
		<label>Excerpt <textarea oninput={(event) => onUpdateField({ excerpt: (event.currentTarget as HTMLTextAreaElement).value })}>{entry.excerpt}</textarea></label>
		<label>Featured Image <input value={entry.featuredImage} oninput={(event) => onUpdateField({ featuredImage: (event.currentTarget as HTMLInputElement).value })} /></label>
		<label>Entry Theme
			<select value={entry.theme ?? ''} onchange={(event) => onUpdateField({ theme: themeValueFromInput((event.currentTarget as HTMLSelectElement).value) })}>
				<option value="">Use global theme</option>
				{#each themeKeys as key}
					<option value={key}>{themes[key].name}</option>
				{/each}
			</select>
		</label>
		{#if entry.kind === 'event'}
			<label>Date <input type="date" value={entry.date} oninput={(event) => onUpdateField({ date: (event.currentTarget as HTMLInputElement).value })} /></label>
			<label>Location <input value={entry.location} oninput={(event) => onUpdateField({ location: (event.currentTarget as HTMLInputElement).value })} /></label>
			<label>Tags <input value={entry.tags.join(', ')} oninput={(event) => onUpdateField({ tags: (event.currentTarget as HTMLInputElement).value.split(',').map((value) => value.trim()).filter(Boolean) })} /></label>
		{:else if entry.kind === 'article'}
			<label>Tags <input value={entry.tags.join(', ')} oninput={(event) => onUpdateField({ tags: (event.currentTarget as HTMLInputElement).value.split(',').map((value) => value.trim()).filter(Boolean) })} /></label>
		{/if}
		<label>Body <textarea class="body" oninput={(event) => onUpdateField({ body: (event.currentTarget as HTMLTextAreaElement).value })}>{entry.body}</textarea></label>

		{#if entry.kind === 'gallery'}
			<div class="upload-block">
				<h4>Images</h4>
				<label>Alt text <input bind:value={uploadAlt} /></label>
				<label>Caption <input bind:value={uploadCaption} /></label>
				<label>Tags <input bind:value={uploadTags} placeholder="comma, separated" /></label>
				<label>Attribution <input bind:value={uploadAttribution} /></label>
				<label>Upload image <input accept="image/*" onchange={handleUploadChange} type="file" /></label>
			</div>

			<div class="image-list">
				{#each entry.images as image, index}
					<div class="image-card">
						<img src={image.src} alt={image.alt} />
						<label>Alt <input value={image.alt} oninput={(event) => onUpdateGalleryImage(index, { alt: (event.currentTarget as HTMLInputElement).value })} /></label>
						<label>Caption <input value={image.caption ?? ''} oninput={(event) => onUpdateGalleryImage(index, { caption: (event.currentTarget as HTMLInputElement).value })} /></label>
						<label>Tags <input value={image.tags.join(', ')} oninput={(event) => onUpdateGalleryImage(index, { tags: (event.currentTarget as HTMLInputElement).value.split(',').map((value) => value.trim()).filter(Boolean) })} /></label>
						<label>Attribution <input value={image.attribution ?? ''} oninput={(event) => onUpdateGalleryImage(index, { attribution: (event.currentTarget as HTMLInputElement).value })} /></label>
						<button class="danger small" onclick={() => onDeleteImage(index, image)} type="button">Delete Image</button>
					</div>
				{/each}
			</div>
		{/if}

		<button class="danger" onclick={onDelete} type="button">Delete Entry</button>
	</div>
</div>

<style>
	.panel,
	.image-list {
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
	.upload-block h4 {
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

	textarea.body {
		min-height: 280px;
	}

	.upload-block {
		padding-top: 1rem;
		border-top: 1px solid #dce4f1;
	}

	.image-list {
		gap: 0.9rem;
	}

	.image-card {
		display: grid;
		gap: 0.7rem;
		padding: 0.9rem;
		border: 1px solid #dce4f1;
		border-radius: 18px;
		background: #fbfdff;
	}

	.image-card img {
		width: 100%;
		height: 180px;
		object-fit: cover;
		border-radius: 14px;
		background: #eef3f8;
	}

	button.danger {
		border: 1px solid #efc7cd;
		border-radius: 999px;
		padding: 0.85rem 1.15rem;
		background: #fff1f1;
		color: #8f1f2c;
		cursor: pointer;
	}

	button.small {
		padding: 0.42rem 0.72rem;
		font-size: 0.84rem;
		white-space: nowrap;
	}
</style>
