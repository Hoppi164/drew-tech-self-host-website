<script lang="ts">
	import CardGrid from '$lib/components/site/CardGrid.svelte';
	import type { SiteCollection, SiteEntry } from '$lib/types/content';
	import { withBase } from '$lib/utils/links';

	type Props = {
		collection: SiteCollection;
		entries: SiteEntry[];
		resolveHref?: (entry: SiteEntry) => string;
	};

	let { collection, entries, resolveHref = (entry) => `/${collection.routeBase}/${entry.slug}` }: Props =
		$props();
</script>

<section class="collection-hero">
	{#if collection.showTitle}
		<h1>{collection.title}</h1>
	{/if}
	<p>{collection.description}</p>
</section>

{#if collection.layout === 'timeline'}
	<section class="timeline">
		{#each entries as entry}
			<article class="timeline-item">
				<div>
					{#if 'date' in entry && collection.showDate}
						<p class="meta">{entry.date}</p>
					{/if}
					<h2><a href={withBase(resolveHref(entry))}>{entry.title}</a></h2>
					{#if collection.showExcerpt}
						<p>{entry.excerpt}</p>
					{/if}
				</div>
			</article>
		{/each}
	</section>
{:else if collection.layout === 'list'}
	<section class="list">
		{#each entries as entry}
			<article class="list-item">
				<h2><a href={withBase(resolveHref(entry))}>{entry.title}</a></h2>
				{#if 'date' in entry && collection.showDate}
					<p class="meta">{entry.date}</p>
				{/if}
				{#if collection.showExcerpt}
					<p>{entry.excerpt}</p>
				{/if}
			</article>
		{/each}
	</section>
{:else}
	<CardGrid title="" items={entries} hrefResolver={resolveHref} />
{/if}

<style>
	.collection-hero {
		padding: 1.5rem 0;
	}

	.meta {
		color: var(--site-muted);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-size: 0.75rem;
	}

	h1,
	h2 {
		font-family: var(--site-heading-font);
	}

	h1 {
		font-size: clamp(2.2rem, 5vw, 4rem);
		margin: 0.2rem 0 0.8rem;
	}

	.collection-hero > p:last-child,
	.list-item p,
	.timeline-item p {
		color: var(--site-muted);
		line-height: 1.7;
	}

	.timeline,
	.list {
		display: grid;
		gap: 1rem;
	}

	.timeline-item,
	.list-item {
		padding: 1.2rem;
		border: 1px solid var(--site-border);
		border-radius: var(--site-radius);
		background: var(--site-surface);
	}

	a {
		color: inherit;
		text-decoration: none;
	}
</style>
