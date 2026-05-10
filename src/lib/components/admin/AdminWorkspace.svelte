<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { untrack } from 'svelte';
	import { get } from 'svelte/store';
	import AccordionPanel from '$lib/components/admin/AccordionPanel.svelte';
	import InfoMarker from '$lib/components/admin/InfoMarker.svelte';
	import SnapshotPreview from '$lib/components/preview/SnapshotPreview.svelte';
	import { draftSourcePath, insertDraftEntity, updateRenderedBody } from '$lib/content/site';
	import { isFineGrainedPat, publishSnapshot, validateToken } from '$lib/github/api';
	import { adminSelection, adminSnapshot, adminToken, pendingUploads } from '$lib/stores/admin';
	import {
		emptyDrafts,
		type EditableEntityType,
		type ImageAsset,
		type SiteCollection,
		type SiteEvent,
		type SiteGallery,
		type SitePage,
		type SitePost,
		type SiteSnapshot
	} from '$lib/types/content';
	import { themeKeys, themes } from '$lib/types/theme';

	type Props = {
		initialSnapshot: SiteSnapshot;
	};

	function themeValueFromInput(value: string) {
		return (value || undefined) as (typeof themeKeys)[number] | undefined;
	}

	function cloneSnapshot<T>(value: T): T {
		return JSON.parse(JSON.stringify(value)) as T;
	}

	let { initialSnapshot }: Props = $props();
	let draftSnapshot = $state<SiteSnapshot>(untrack(() => cloneSnapshot(initialSnapshot)));
	let token = $state('');
	let status = $state('');
	let error = $state('');
	let unlocked = $state(false);
	let activeType = $state<EditableEntityType | 'site'>('site');
	let activeSlug = $state('site');
	let uploadAlt = $state('');
	let uploadCaption = $state('');
	let uploadTags = $state('');
	let uploadAttribution = $state('');

	$effect(() => {
		adminSnapshot.set(draftSnapshot);
	});

	const repo = $derived({
		owner: draftSnapshot.site.repo.owner,
		name: draftSnapshot.site.repo.name,
		branch: draftSnapshot.site.repo.branch
	});

	const repoUrl = $derived(`https://github.com/${repo.owner}/${repo.name}`);
	const githubLinks = $derived({
		repo: repoUrl,
		actions: `${repoUrl}/actions`,
		pages: `${repoUrl}/settings/pages`,
		token:
			'https://github.com/settings/personal-access-tokens/new?name=self-host-website&description=token-used-to-authenticate-admin-user-on-self-hosted-website&expires_in=none&contents=write&metadata=read',
		settings: `${repoUrl}/settings`
	});

	const selectedPage = $derived(draftSnapshot.pages.find((page) => page.slug === activeSlug));
	const selectedPost = $derived(draftSnapshot.posts.find((post) => post.slug === activeSlug));
	const selectedEvent = $derived(draftSnapshot.events.find((event) => event.slug === activeSlug));
	const selectedGallery = $derived(draftSnapshot.galleries.find((gallery) => gallery.slug === activeSlug));
	const selectedCollection = $derived(
		draftSnapshot.collections.find((collection) => collection.slug === activeSlug)
	);

	const navGroups = $derived([
		{
			label: 'Pages',
			items: draftSnapshot.pages.map((page) => ({ type: 'page' as const, slug: page.slug, title: page.title })),
			create: 'page' as const
		},
		{
			label: 'Posts',
			items: draftSnapshot.posts.map((post) => ({ type: 'post' as const, slug: post.slug, title: post.title })),
			create: 'post' as const
		},
		{
			label: 'Events',
			items: draftSnapshot.events.map((event) => ({ type: 'event' as const, slug: event.slug, title: event.title })),
			create: 'event' as const
		},
		{
			label: 'Galleries',
			items: draftSnapshot.galleries.map((gallery) => ({
				type: 'gallery' as const,
				slug: gallery.slug,
				title: gallery.title
			})),
			create: 'gallery' as const
		},
		{
			label: 'Collections',
			items: draftSnapshot.collections.map((collection) => ({
				type: 'collection' as const,
				slug: collection.slug,
				title: collection.title
			})),
			create: 'collection' as const
		}
	]);

	function choose(type: EditableEntityType | 'site', slug: string) {
		activeType = type;
		activeSlug = slug;
		adminSelection.set({ type, slug });
	}

	function updateSiteField(path: string, value: string) {
		const next = cloneSnapshot(draftSnapshot);
		const target = next.site as Record<string, unknown>;
		const segments = path.split('.');
		let cursor: Record<string, unknown> = target;
		for (const segment of segments.slice(0, -1)) {
			cursor = cursor[segment] as Record<string, unknown>;
		}
		cursor[segments.at(-1)!] = value;
		draftSnapshot = next;
	}

	function upsertEntity(
		type: EditableEntityType,
		entity: SitePage | SitePost | SiteEvent | SiteGallery | SiteCollection
	) {
		draftSnapshot = insertDraftEntity(draftSnapshot, type, entity);
	}

	function createEntity(type: EditableEntityType) {
		const next = cloneSnapshot(emptyDrafts[type]);
		choose(type, next.slug);
		upsertEntity(type, 'body' in next ? updateRenderedBody(next as SitePage | SitePost | SiteEvent) : next);
	}

	async function unlock() {
		error = '';
		status = '';
		if (!isFineGrainedPat(token)) {
			error = 'Use a fine-grained GitHub PAT that starts with github_pat_.';
			return;
		}

		try {
			await validateToken(token, repo);
			adminToken.set(token);
			unlocked = true;
			status = 'Logged in. Token is stored in memory only for this tab.';
		} catch (caught) {
			error = caught instanceof Error ? caught.message : 'Failed to validate token.';
		}
	}

	function lockAdmin() {
		adminToken.set(null);
		unlocked = false;
		token = '';
		status = '';
		error = '';
	}

	function updateBody(
		type: 'page' | 'post' | 'event',
		entity: SitePage | SitePost | SiteEvent,
		field: string,
		value: string | undefined
	) {
		const next = { ...entity, [field]: value } as SitePage | SitePost | SiteEvent;
		upsertEntity(type, updateRenderedBody(next));
	}

	function updatePageSlug(entity: SitePage, slug: string) {
		const next = updateRenderedBody({
			...entity,
			slug,
			sourcePath: draftSourcePath('page', slug)
		});
		draftSnapshot = insertDraftEntity(draftSnapshot, 'page', next, {
			slug: entity.slug,
			sourcePath: entity.sourcePath
		});
		choose('page', slug);
	}

	function updateGallery(field: keyof SiteGallery, value: string | undefined) {
		if (!selectedGallery) return;
		upsertEntity('gallery', { ...selectedGallery, [field]: value });
	}

	function updateCollection(field: keyof SiteCollection, value: string[]) {
		if (!selectedCollection) return;
		upsertEntity('collection', { ...selectedCollection, [field]: value });
	}

	async function handleUpload(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file || !selectedGallery) return;

		const bytes = new Uint8Array(await file.arrayBuffer());
		const path = `static/uploads/${file.name}`;
		const previewUrl = URL.createObjectURL(file);
		const upload = {
			path,
			bytes,
			previewUrl,
			alt: uploadAlt || file.name,
			caption: uploadCaption,
			tags: uploadTags
				.split(',')
				.map((tag) => tag.trim())
				.filter(Boolean),
			attribution: uploadAttribution
		};

		pendingUploads.update((uploads) => [...uploads, upload]);

		const item: ImageAsset = {
			src: `/${path.replace(/^static/, '')}`,
			alt: upload.alt,
			caption: upload.caption,
			tags: upload.tags,
			attribution: upload.attribution
		};

		upsertEntity('gallery', {
			...selectedGallery,
			coverImage: selectedGallery.coverImage || item.src,
			items: [...selectedGallery.items, item]
		});
	}

	async function publish() {
		const currentToken = get(adminToken);
		if (!currentToken) {
			error = 'Log in with a valid token before publishing.';
			return;
		}

		error = '';
		status = 'Publishing changes to GitHub...';
		try {
			await publishSnapshot(currentToken, repo, draftSnapshot, get(pendingUploads));
			status = 'Published. GitHub Actions should rebuild the site shortly.';
			pendingUploads.set([]);
		} catch (caught) {
			error = caught instanceof Error ? caught.message : 'Publish failed.';
		}
	}

	function isActive(type: EditableEntityType | 'site', slug: string) {
		return activeType === type && activeSlug === slug;
	}
</script>

{#if !unlocked}
	<section class="login-screen">
		<div class="login-card">
			<div class="login-copy">
				<h1 class="login-title">Admin Login</h1>
				<p>
					Use a GitHub personal access token for this repository to sign in and publish site
					changes. The token stays in this browser tab and is only used for GitHub API requests.
				</p>
			</div>

			<label>
				<span class="field-label">
					Github PAT
					<InfoMarker href={githubLinks.token} label="What is a GitHub PAT?">
						{#snippet children()}
							A personal access token is a GitHub-generated credential that lets this admin screen
							save content changes back to your repository without a separate backend.
						{/snippet}
					</InfoMarker>
				</span>
				<input aria-label="Github PAT" bind:value={token} placeholder="github_pat_..." type="password" />
			</label>
			<button class="primary login-button" onclick={unlock} type="button">
				<span>Log In to CMS</span>
				<span aria-hidden="true">↗</span>
			</button>

			<div class="status">
				{#if status}<p>{status}</p>{/if}
				{#if error}<p class="error">{error}</p>{/if}
			</div>

			<AccordionPanel summary="First time setting this up?">
				{#snippet children()}
					<div class="setup-help">
						<ol>
							<li><a href={githubLinks.repo} target="_blank" rel="noreferrer">Open this repository</a></li>
							<li><a href={githubLinks.actions} target="_blank" rel="noreferrer">Enable GitHub Actions</a></li>
							<li><a href={githubLinks.pages} target="_blank" rel="noreferrer">Enable GitHub Pages deployment</a></li>
							<li><a href={githubLinks.token} target="_blank" rel="noreferrer">Create a fine-grained PAT</a></li>
						</ol>
						<p>
							When creating the token, choose `Only select repositories`, pick this repo, and
							grant `Contents: write` plus `Metadata: read`.
						</p>
					</div>
				{/snippet}
			</AccordionPanel>
		</div>
	</section>
{:else}
	<div class="admin-layout">
		<aside class="sidebar">
			<div class="sidebar-head">
				<div>
					<p class="eyebrow">CMS</p>
					<h1>Content Studio</h1>
				</div>
				<button class="ghost small logout-button" onclick={lockAdmin} type="button">
					<span>Log Out</span>
					<span aria-hidden="true">↗</span>
				</button>
			</div>

			<p class="sidebar-copy">
				Choose a section, edit content, preview changes live, then publish when the draft looks right.
			</p>

			<nav class="nav-list" aria-label="CMS sections">
				<button
					aria-label="Site Settings"
					class:active={isActive('site', 'site')}
					class="nav-root-item"
					onclick={() => choose('site', 'site')}
					type="button"
				>
					<span>Site Settings</span>
				</button>

				{#each navGroups as group}
					<section class="nav-group">
						<div class="nav-group-head">
							<div>
								<h2>{group.label}</h2>
							</div>
							{#if group.create}
								<button class="ghost nav-new" onclick={() => createEntity(group.create)} type="button" aria-label={`Create new ${group.label.slice(0, -1).toLowerCase()}`}>
									<span>New</span>
									<span aria-hidden="true">+</span>
								</button>
							{/if}
						</div>
						<div class="nav-items">
							{#each group.items as item}
								<button
									class:active={isActive(item.type, item.slug)}
									class="nav-item"
									aria-label={item.title}
									onclick={() => choose(item.type, item.slug)}
									type="button"
								>
									<span>{item.title}</span>
								</button>
							{/each}
						</div>
					</section>
				{/each}
			</nav>
		</aside>

		<section class="workspace">
			<header class="workspace-head">
				<div>
					<p class="eyebrow">Editing</p>
					<h2>{activeType === 'site' ? 'Site Settings' : activeSlug}</h2>
					{#if status}<p class="status-inline">{status}</p>{/if}
					{#if error}<p class="status-inline error">{error}</p>{/if}
				</div>
				<div class="workspace-actions">
					<button class="ghost" onclick={() => goto(`${base}/admin/preview?type=${activeType}&slug=${activeSlug}`)} type="button">
						Open Full Preview
					</button>
					<button class="primary" onclick={publish} type="button">Publish to GitHub</button>
				</div>
			</header>

			<div class="workspace-grid">
				<section class="editor">
					{#if activeType === 'site'}
						<div class="panel">
							<h3>Brand, Repo, and Theme</h3>
							<label>Business Name <input value={draftSnapshot.site.business.name} oninput={(event) => updateSiteField('business.name', (event.currentTarget as HTMLInputElement).value)} /></label>
							<label>Tagline <input value={draftSnapshot.site.business.tagline} oninput={(event) => updateSiteField('business.tagline', (event.currentTarget as HTMLInputElement).value)} /></label>
							<label>Description <textarea oninput={(event) => updateSiteField('business.description', (event.currentTarget as HTMLTextAreaElement).value)}>{draftSnapshot.site.business.description}</textarea></label>
							<label>GitHub Owner <input value={draftSnapshot.site.repo.owner} oninput={(event) => updateSiteField('repo.owner', (event.currentTarget as HTMLInputElement).value)} /></label>
							<label>Repository Name <input value={draftSnapshot.site.repo.name} oninput={(event) => updateSiteField('repo.name', (event.currentTarget as HTMLInputElement).value)} /></label>
							<label>Base Path <input value={draftSnapshot.site.repo.basePath} oninput={(event) => updateSiteField('repo.basePath', (event.currentTarget as HTMLInputElement).value)} placeholder='"" for root, "/gardening" for subpath' /></label>
							<label>Global Theme
								<select value={draftSnapshot.site.theme.global} onchange={(event) => updateSiteField('theme.global', (event.currentTarget as HTMLSelectElement).value)}>
									{#each themeKeys as key}
										<option value={key}>{themes[key].name}</option>
									{/each}
								</select>
							</label>
						</div>
					{:else if activeType === 'page' && selectedPage}
						<div class="panel">
							<h3>Page Editor</h3>
							<label>Title <input value={selectedPage.title} oninput={(event) => updateBody('page', selectedPage, 'title', (event.currentTarget as HTMLInputElement).value)} /></label>
							<label>Slug <input value={selectedPage.slug} oninput={(event) => updatePageSlug(selectedPage, (event.currentTarget as HTMLInputElement).value)} /></label>
							<label>Excerpt <textarea oninput={(event) => updateBody('page', selectedPage, 'excerpt', (event.currentTarget as HTMLTextAreaElement).value)}>{selectedPage.excerpt}</textarea></label>
							<label>Page Theme
								<select value={selectedPage.theme ?? ''} onchange={(event) => updateBody('page', selectedPage, 'theme', themeValueFromInput((event.currentTarget as HTMLSelectElement).value))}>
									<option value="">Use global theme</option>
									{#each themeKeys as key}
										<option value={key}>{themes[key].name}</option>
									{/each}
								</select>
							</label>
							<label>Body <textarea class="body" oninput={(event) => updateBody('page', selectedPage, 'body', (event.currentTarget as HTMLTextAreaElement).value)}>{selectedPage.body}</textarea></label>
						</div>
					{:else if activeType === 'post' && selectedPost}
						<div class="panel">
							<h3>Post Editor</h3>
							<label>Title <input value={selectedPost.title} oninput={(event) => updateBody('post', selectedPost, 'title', (event.currentTarget as HTMLInputElement).value)} /></label>
							<label>Date <input type="date" value={selectedPost.date} oninput={(event) => updateBody('post', selectedPost, 'date', (event.currentTarget as HTMLInputElement).value)} /></label>
							<label>Post Theme
								<select value={selectedPost.theme ?? ''} onchange={(event) => updateBody('post', selectedPost, 'theme', themeValueFromInput((event.currentTarget as HTMLSelectElement).value))}>
									<option value="">Use global theme</option>
									{#each themeKeys as key}
										<option value={key}>{themes[key].name}</option>
									{/each}
								</select>
							</label>
							<label>Body <textarea class="body" oninput={(event) => updateBody('post', selectedPost, 'body', (event.currentTarget as HTMLTextAreaElement).value)}>{selectedPost.body}</textarea></label>
						</div>
					{:else if activeType === 'event' && selectedEvent}
						<div class="panel">
							<h3>Event Editor</h3>
							<label>Title <input value={selectedEvent.title} oninput={(event) => updateBody('event', selectedEvent, 'title', (event.currentTarget as HTMLInputElement).value)} /></label>
							<label>Date <input type="date" value={selectedEvent.date} oninput={(event) => updateBody('event', selectedEvent, 'date', (event.currentTarget as HTMLInputElement).value)} /></label>
							<label>Location <input value={selectedEvent.location} oninput={(event) => updateBody('event', selectedEvent, 'location', (event.currentTarget as HTMLInputElement).value)} /></label>
							<label>Event Theme
								<select value={selectedEvent.theme ?? ''} onchange={(event) => updateBody('event', selectedEvent, 'theme', themeValueFromInput((event.currentTarget as HTMLSelectElement).value))}>
									<option value="">Use global theme</option>
									{#each themeKeys as key}
										<option value={key}>{themes[key].name}</option>
									{/each}
								</select>
							</label>
							<label>Body <textarea class="body" oninput={(event) => updateBody('event', selectedEvent, 'body', (event.currentTarget as HTMLTextAreaElement).value)}>{selectedEvent.body}</textarea></label>
						</div>
					{:else if activeType === 'gallery' && selectedGallery}
						<div class="panel">
							<h3>Gallery Editor</h3>
							<label>Title <input value={selectedGallery.title} oninput={(event) => updateGallery('title', (event.currentTarget as HTMLInputElement).value)} /></label>
							<label>Description <textarea oninput={(event) => updateGallery('description', (event.currentTarget as HTMLTextAreaElement).value)}>{selectedGallery.description}</textarea></label>
							<label>Gallery Theme
								<select value={selectedGallery.theme ?? ''} onchange={(event) => updateGallery('theme', themeValueFromInput((event.currentTarget as HTMLSelectElement).value))}>
									<option value="">Use global theme</option>
									{#each themeKeys as key}
										<option value={key}>{themes[key].name}</option>
									{/each}
								</select>
							</label>
							<div class="upload-block">
								<h4>Upload Image</h4>
								<label>Alt Text <input bind:value={uploadAlt} /></label>
								<label>Caption <input bind:value={uploadCaption} /></label>
								<label>Tags <input bind:value={uploadTags} placeholder="comma,separated" /></label>
								<label>Attribution <input bind:value={uploadAttribution} /></label>
								<input accept="image/*" onchange={handleUpload} type="file" />
							</div>
						</div>
					{:else if activeType === 'collection' && selectedCollection}
						<div class="panel">
							<h3>Collection Editor</h3>
							<label>Title <input value={selectedCollection.title} oninput={(event) => upsertEntity('collection', { ...selectedCollection, title: (event.currentTarget as HTMLInputElement).value })} /></label>
							<label>Description <textarea oninput={(event) => upsertEntity('collection', { ...selectedCollection, description: (event.currentTarget as HTMLTextAreaElement).value })}>{selectedCollection.description}</textarea></label>
							<label>Collection Theme
								<select value={selectedCollection.theme ?? ''} onchange={(event) => upsertEntity('collection', { ...selectedCollection, theme: themeValueFromInput((event.currentTarget as HTMLSelectElement).value) })}>
									<option value="">Use global theme</option>
									{#each themeKeys as key}
										<option value={key}>{themes[key].name}</option>
									{/each}
								</select>
							</label>
							<label>Page Slugs <input value={selectedCollection.pageSlugs.join(', ')} oninput={(event) => updateCollection('pageSlugs', (event.currentTarget as HTMLInputElement).value.split(',').map((value) => value.trim()).filter(Boolean))} /></label>
							<label>Gallery Slugs <input value={selectedCollection.gallerySlugs.join(', ')} oninput={(event) => updateCollection('gallerySlugs', (event.currentTarget as HTMLInputElement).value.split(',').map((value) => value.trim()).filter(Boolean))} /></label>
							<label>Post Slugs <input value={selectedCollection.postSlugs.join(', ')} oninput={(event) => updateCollection('postSlugs', (event.currentTarget as HTMLInputElement).value.split(',').map((value) => value.trim()).filter(Boolean))} /></label>
							<label>Event Slugs <input value={selectedCollection.eventSlugs.join(', ')} oninput={(event) => updateCollection('eventSlugs', (event.currentTarget as HTMLInputElement).value.split(',').map((value) => value.trim()).filter(Boolean))} /></label>
						</div>
					{/if}
				</section>

				<section class="preview">
					<div class="preview-card">
						<div class="preview-card-head">
							<div>
								<h3>Live Preview</h3>
								<p>The preview uses the same renderer and theme CSS as the public site.</p>
							</div>
						</div>
						<div class="preview-frame">
							<SnapshotPreview snapshot={draftSnapshot} type={activeType} slug={activeSlug} />
						</div>
					</div>
				</section>
			</div>
		</section>
	</div>
{/if}

<style>
	.login-screen {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 2rem;
		background:
			radial-gradient(circle at top left, rgba(77, 118, 174, 0.16), transparent 34%),
			linear-gradient(180deg, #f5f7fb 0%, #eef2f9 100%);
	}

	.login-card {
		width: min(760px, 100%);
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(14px);
		border: 1px solid #d9deea;
		border-radius: 30px;
		padding: 2rem;
		box-shadow: 0 30px 80px rgba(25, 39, 58, 0.12);
	}

	.sidebar-head h1,
	.workspace-head h2,
	.panel h3 {
		margin: 0;
		font-family: Georgia, serif;
	}

	.login-copy {
		margin-bottom: 1rem;
	}

	.login-title {
		font-family: Georgia, serif;
		font-size: clamp(1.2rem, 2.1vw, 1.65rem);
		letter-spacing: 0.02em;
		text-transform: none;
		color: #11161d;
		line-height: 1.05;
		margin: 0 0 0.75rem;
	}

	.field-label {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
	}

	.eyebrow {
		margin: 0 0 0.35rem;
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: #5d6f8a;
	}

	.setup-help {
		color: #425267;
	}

	.setup-help ol {
		margin: 0;
		padding-left: 1.2rem;
		line-height: 1.8;
	}

	.setup-help a {
		color: #1e4d8c;
	}

	.status {
		min-height: 2rem;
		margin-top: 0.75rem;
	}

	.error {
		color: #a33d34;
	}

	.admin-layout {
		display: grid;
		grid-template-columns: 320px minmax(0, 1fr);
		min-height: 100vh;
		background: #f3f6fb;
		color: #1c2430;
	}

	.sidebar {
		padding: 1.2rem;
		border-right: 1px solid #d9deea;
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(249, 251, 255, 0.94));
	}

	.sidebar-head,
	.workspace-head {
		display: flex;
		justify-content: space-between;
		align-items: start;
		gap: 1rem;
	}

	.sidebar-copy,
	.status-inline,
	.preview-card-head p,
	.setup-help p,
	.login-copy p {
		color: #617086;
	}

	.nav-list {
		display: grid;
		gap: 0.9rem;
		margin-top: 1.2rem;
	}

	.nav-root-item,
	.nav-item {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 0.8rem;
		width: 100%;
		text-align: left;
		color: #243244;
	}

	.nav-root-item {
		padding: 0.85rem 0.25rem 0.85rem 0.85rem;
		border: 1px solid transparent;
		border-radius: 14px;
		background: transparent;
		border-left: 3px solid #cbd5e4;
	}

	.nav-root-item.active,
	.nav-item.active {
		background: rgba(232, 240, 255, 0.9);
		border-color: #b2caf8;
		box-shadow: inset 0 0 0 1px rgba(61, 110, 204, 0.08);
	}

	.nav-root-item.active {
		border-left-color: #4d72ae;
	}

	.nav-group {
		padding-left: 0.35rem;
		border-left: 1px solid #d9deea;
	}

	.nav-group-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.45rem;
		padding-left: 0.5rem;
	}

	.nav-group h2 {
		margin: 0;
		font-size: 0.92rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #5d6f8a;
	}

	.nav-items {
		display: grid;
		gap: 0.2rem;
	}

	.nav-item {
		padding: 0.7rem 0.25rem 0.7rem 0.85rem;
		border: 1px solid transparent;
		border-radius: 14px;
		background: transparent;
		border-left: 3px solid transparent;
	}

	.nav-item.active {
		border-left-color: #4d72ae;
	}

	.workspace {
		padding: 1.2rem;
	}

	.workspace-grid {
		display: grid;
		grid-template-columns: minmax(360px, 440px) minmax(0, 1fr);
		gap: 1rem;
		margin-top: 1rem;
	}

	.workspace-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
	}

	.editor,
	.preview {
		min-width: 0;
	}

	.panel,
	.preview-card {
		background: white;
		padding: 1rem;
		border: 1px solid #d9deea;
		border-radius: 24px;
		box-shadow: 0 18px 34px rgba(22, 38, 59, 0.06);
	}

	.preview-frame {
		margin-top: 0.8rem;
		border: 1px solid #d9deea;
		border-radius: 20px;
		overflow: auto;
		background: white;
		max-height: calc(100vh - 14rem);
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

	button {
		border: 0;
		border-radius: 999px;
		padding: 0.85rem 1.15rem;
		cursor: pointer;
	}

	button.primary {
		background: #1f3046;
		color: white;
	}

	button.login-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
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
		gap: 0.35rem;
	}

	button.nav-new {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.28rem;
		padding: 0.34rem 0.56rem;
		font-size: 0.8rem;
		line-height: 1;
	}

	button.nav-new span:first-child {
		font-size: 0.84rem;
		font-weight: 600;
		line-height: 1;
	}

	.upload-block {
		padding-top: 1rem;
		border-top: 1px solid #d9deea;
	}

	@media (max-width: 1200px) {
		.admin-layout,
		.workspace-grid {
			grid-template-columns: 1fr;
		}

		.sidebar {
			border-right: 0;
			border-bottom: 1px solid #d9deea;
		}

		.preview-frame {
			max-height: none;
		}
	}
</style>
