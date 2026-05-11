<script lang="ts">
	import type { SiteCollection, SiteEntry } from '$lib/types/content';
	import { withBase } from '$lib/utils/links';

	type Props = {
		collection: SiteCollection;
		entry: SiteEntry;
	};

	let { collection, entry }: Props = $props();
</script>

<article class="article">
	<header>
		<p class="meta">
			{collection.title}
			{#if entry.kind === 'event' && collection.showDate}
				<span> · {entry.date}</span>
			{/if}
			{#if entry.kind === 'event' && entry.location}
				<span> · {entry.location}</span>
			{/if}
		</p>
		{#if entry.showTitle}
			<h1>{entry.title}</h1>
		{/if}
		{#if collection.showExcerpt}
			<p class="excerpt">{entry.excerpt}</p>
		{/if}
	</header>

	{#if collection.showFeaturedImage && entry.featuredImage}
		<img class="hero" src={withBase(entry.featuredImage)} alt="" />
	{/if}

	{#if entry.kind === 'gallery' && collection.showImageGrid}
		<section class="gallery-grid">
			{#each entry.images as image}
				<figure>
					<img src={withBase(image.src)} alt={image.alt} />
					<figcaption>
						<strong>{image.alt}</strong>
						{#if image.caption}
							<span>{image.caption}</span>
						{/if}
					</figcaption>
				</figure>
			{/each}
		</section>
	{/if}

	{#if collection.showBodyPreview || entry.body}
		<div class="prose">{@html entry.html}</div>
	{/if}
</article>

<style>
	.article {
		background: var(--site-surface);
		border: 1px solid var(--site-border);
		border-radius: var(--site-radius);
		padding: 2rem;
	}

	.meta,
	.excerpt,
	figcaption span {
		color: var(--site-muted);
	}

	.meta {
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-size: 0.76rem;
	}

	h1 {
		font-family: var(--site-heading-font);
		font-size: clamp(2.2rem, 5vw, 4rem);
		margin: 0 0 1rem;
	}

	.hero {
		width: 100%;
		height: clamp(260px, 48vw, 440px);
		object-fit: cover;
		border-radius: calc(var(--site-radius) - 10px);
		margin-bottom: 1.4rem;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
		padding: 0.5rem 0 1.25rem;
	}

	figure {
		margin: 0;
		padding: 0.8rem;
		border: 1px solid var(--site-border);
		border-radius: calc(var(--site-radius) - 4px);
		background: color-mix(in srgb, var(--site-surface) 92%, white 8%);
	}

	figure img {
		width: 100%;
		height: 220px;
		object-fit: cover;
		border-radius: calc(var(--site-radius) - 12px);
	}

	figcaption {
		display: grid;
		gap: 0.25rem;
		padding-top: 0.7rem;
	}

	.prose :global(p) {
		line-height: 1.8;
		color: var(--site-text);
	}
</style>
