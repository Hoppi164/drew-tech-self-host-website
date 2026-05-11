<script lang="ts">
	import AdminInputToggleField from '$lib/components/admin/AdminInputToggleField.svelte';
	import { onDestroy, untrack } from 'svelte';
	import type { SitePage } from '$lib/types/content';
	import { themeKeys, themes } from '$lib/types/theme';
	import { createDebouncedCallback } from '$lib/utils/debounce';

	type Props = {
		page: SitePage;
		onUpdateField: <K extends keyof SitePage>(field: K, value: SitePage[K]) => void;
		onUpdateSlug: (slug: string) => void;
		onDelete: () => void;
	};

	let { page, onUpdateField, onUpdateSlug, onDelete }: Props = $props();
	let slugDraft = $state(untrack(() => page.slug));
	let committedSlug = $state(untrack(() => page.slug));

	function themeValueFromInput(value: string) {
		return (value || undefined) as (typeof themeKeys)[number] | undefined;
	}

	const debouncedSlugCommit = createDebouncedCallback((nextSlug: string) => {
		committedSlug = nextSlug;
		onUpdateSlug(nextSlug);
	}, 850);

	$effect(() => {
		if (page.slug !== committedSlug) {
			committedSlug = page.slug;
			slugDraft = page.slug;
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
		<h3>Page Editor</h3>
		<AdminInputToggleField
			checked={page.showTitle}
			label="Title"
			toggleLabel="Show page title"
			value={page.title}
			onInput={(value) => onUpdateField('title', value)}
			onToggle={(checked) => onUpdateField('showTitle', checked)}
		/>
		<label>Slug <input onblur={flushSlugCommit} oninput={handleSlugInput} value={slugDraft} /></label>
		<label>Excerpt <textarea oninput={(event) => onUpdateField('excerpt', (event.currentTarget as HTMLTextAreaElement).value)}>{page.excerpt}</textarea></label>
		<label>Page Theme
			<select value={page.theme ?? ''} onchange={(event) => onUpdateField('theme', themeValueFromInput((event.currentTarget as HTMLSelectElement).value))}>
				<option value="">Use global theme</option>
				{#each themeKeys as key}
					<option value={key}>{themes[key].name}</option>
				{/each}
			</select>
		</label>
		<label>Body <textarea class="body" oninput={(event) => onUpdateField('body', (event.currentTarget as HTMLTextAreaElement).value)}>{page.body}</textarea></label>
		<button class="danger" onclick={onDelete} type="button">Delete Page</button>
	</div>
</div>

<style>
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

	textarea.body {
		min-height: 280px;
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
