<script lang="ts" generics="T extends { slug: string; title: string; excerpt?: string; description?: string; featuredImage?: string; coverImage?: string }">
	import { withBase } from '$lib/utils/links';

	type Props<T> = {
		title: string;
		items: T[];
		hrefPrefix?: string;
		hrefResolver?: (item: T) => string;
	};

	let { title, items, hrefPrefix = '', hrefResolver }: Props<T> = $props();

	function hrefFor(item: T) {
		return hrefResolver ? hrefResolver(item) : `${hrefPrefix}/${item.slug}`;
	}
</script>

{#if items.length}
	<section class="section">
		<div class="section-head">
			<h2>{title}</h2>
		</div>
		<div class="grid">
			{#each items as item}
				<article class="card">
					{#if item.featuredImage || item.coverImage}
						<img src={withBase(item.featuredImage ?? item.coverImage ?? '')} alt="" />
					{/if}
					<h3><a href={withBase(hrefFor(item))}>{item.title}</a></h3>
					<p>{item.excerpt ?? item.description ?? ''}</p>
				</article>
			{/each}
		</div>
	</section>
{/if}

<style>
	.section {
		padding: 1.5rem 0 0;
	}

	.section-head h2 {
		font-family: var(--site-heading-font);
		font-size: clamp(1.8rem, 4vw, 2.8rem);
		margin-bottom: 1rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
	}

	.card {
		padding: 1rem;
		border: 1px solid var(--site-border);
		border-radius: var(--site-radius);
		background: var(--site-surface);
	}

	img {
		width: 100%;
		height: 180px;
		object-fit: cover;
		border-radius: calc(var(--site-radius) - 10px);
		margin-bottom: 0.85rem;
	}

	h3 {
		font-family: var(--site-heading-font);
		font-size: 1.45rem;
		margin: 0 0 0.5rem;
	}

	h3 a {
		color: inherit;
		text-decoration: none;
	}

	p {
		margin: 0;
		color: var(--site-muted);
		line-height: 1.6;
	}
</style>
