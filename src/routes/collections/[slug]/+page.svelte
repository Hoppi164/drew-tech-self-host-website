<script lang="ts">
	import CardGrid from '$lib/components/site/CardGrid.svelte';
	import SiteShell from '$lib/components/site/SiteShell.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<SiteShell
	theme={data.themeKey}
	siteName={data.snapshot.site.business.name}
	tagline={data.snapshot.site.business.tagline}
	navigation={data.snapshot.site.navigation}
	socialLinks={data.snapshot.site.socialLinks}
	activePath="/collections"
>
	{#snippet children()}
		<section class="collection">
			<h1>{data.collection.title}</h1>
			<p>{data.collection.description}</p>
		</section>
		<CardGrid title="Pages" items={data.pages} hrefPrefix="" />
		<CardGrid title="Galleries" items={data.galleries} hrefPrefix="/galleries" />
		<CardGrid title="Posts" items={data.posts} hrefPrefix="/posts" />
		<CardGrid title="Events" items={data.events} hrefPrefix="/events" />
	{/snippet}
</SiteShell>

<style>
	.collection {
		background: var(--site-surface);
		border: 1px solid var(--site-border);
		border-radius: var(--site-radius);
		padding: 2rem;
		margin-bottom: 1rem;
	}

	h1 {
		font-family: var(--site-heading-font);
		font-size: clamp(2.2rem, 5vw, 4rem);
		margin: 0 0 0.75rem;
	}

	p {
		margin: 0;
		line-height: 1.7;
		color: var(--site-muted);
	}
</style>
