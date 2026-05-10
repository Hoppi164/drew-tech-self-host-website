<script lang="ts">
	import type { SiteGallery } from '$lib/types/content';
	import { withBase } from '$lib/utils/links';

	type Props = {
		gallery: SiteGallery;
	};

	let { gallery }: Props = $props();
</script>

<section class="section">
	<div class="section-head">
		<h2>{gallery.title}</h2>
		<p>{gallery.description}</p>
	</div>
	<div class="grid">
		{#each gallery.items as item}
			<figure>
				<img src={withBase(item.src)} alt={item.alt} />
				<figcaption>
					<strong>{item.alt}</strong>
					{#if item.caption}
						<span>{item.caption}</span>
					{/if}
				</figcaption>
			</figure>
		{/each}
	</div>
</section>

<style>
	.section {
		padding-top: 1.5rem;
	}

	.section-head h2 {
		font-family: var(--site-heading-font);
		font-size: clamp(1.8rem, 4vw, 2.8rem);
		margin: 0 0 0.4rem;
	}

	.section-head p {
		margin: 0 0 1rem;
		color: var(--site-muted);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1rem;
	}

	figure {
		background: var(--site-surface);
		border: 1px solid var(--site-border);
		border-radius: var(--site-radius);
		padding: 0.8rem;
		margin: 0;
	}

	img {
		width: 100%;
		height: 230px;
		object-fit: cover;
		border-radius: calc(var(--site-radius) - 10px);
	}

	figcaption {
		padding-top: 0.75rem;
		display: grid;
		gap: 0.25rem;
	}

	span {
		color: var(--site-muted);
	}
</style>
