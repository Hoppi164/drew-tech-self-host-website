<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import type { SiteConfig, SitePage } from '$lib/types/content';
	import { themeKeys, themes } from '$lib/types/theme';
	import { createDebouncedCallback } from '$lib/utils/debounce';

	type Props = {
		page: SitePage;
		contact: SiteConfig['contact'];
		onUpdateField: (field: keyof SitePage, value: string | undefined) => void;
		onUpdateContactField: (field: keyof SiteConfig['contact'], value: string) => void;
		onUpdateSlug: (slug: string) => void;
		onDelete: () => void;
	};

	let { page, contact, onUpdateField, onUpdateContactField, onUpdateSlug, onDelete }: Props =
		$props();
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
		<label>Title <input value={page.title} oninput={(event) => onUpdateField('title', (event.currentTarget as HTMLInputElement).value)} /></label>
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
		{#if page.slug === 'contact'}
			<div class="contact-section">
				<h4>Contact Panel</h4>
				<label>Panel Title <input value={contact.title} oninput={(event) => onUpdateContactField('title', (event.currentTarget as HTMLInputElement).value)} /></label>
				<label>Intro <textarea oninput={(event) => onUpdateContactField('intro', (event.currentTarget as HTMLTextAreaElement).value)}>{contact.intro}</textarea></label>
				<label>Email <input type="email" value={contact.email} oninput={(event) => onUpdateContactField('email', (event.currentTarget as HTMLInputElement).value)} /></label>
				<label>Phone <input value={contact.phone} oninput={(event) => onUpdateContactField('phone', (event.currentTarget as HTMLInputElement).value)} /></label>
				<label>Address <textarea oninput={(event) => onUpdateContactField('address', (event.currentTarget as HTMLTextAreaElement).value)}>{contact.address}</textarea></label>
				<label>CTA Label <input value={contact.ctaLabel} oninput={(event) => onUpdateContactField('ctaLabel', (event.currentTarget as HTMLInputElement).value)} /></label>
				<label>CTA URL <input value={contact.ctaUrl} oninput={(event) => onUpdateContactField('ctaUrl', (event.currentTarget as HTMLInputElement).value)} /></label>
			</div>
		{/if}
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

	.contact-section {
		display: grid;
		gap: 0.9rem;
		padding-top: 1rem;
		border-top: 1px solid #dce4f1;
	}

	.contact-section h4 {
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
