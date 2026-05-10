<script lang="ts">
	type Props = {
		title: string;
		copy: string;
		ctaLabel?: string;
		ctaPath?: string;
		image?: string;
		align?: 'start' | 'center';
	};

	import { withBase } from '$lib/utils/links';

	let { title, copy, ctaLabel = '', ctaPath = '', image = '', align = 'start' }: Props = $props();
</script>

<section class:centered={align === 'center'} class="hero">
	<div class="copy">
		<p class="eyebrow">Static-first website template</p>
		<h1>{title}</h1>
		<p>{copy}</p>
		{#if ctaLabel && ctaPath}
			<a class="cta" href={withBase(ctaPath)}>{ctaLabel}</a>
		{/if}
	</div>

	{#if image}
		<img src={withBase(image)} alt="" />
	{/if}
</section>

<style>
	.hero {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 2rem;
		align-items: center;
		padding: 2rem 0 3rem;
	}

	.copy {
		background: var(--site-surface);
		border: 1px solid var(--site-border);
		border-radius: var(--site-radius);
		padding: 2rem;
	}

	.centered .copy {
		text-align: center;
	}

	.eyebrow {
		text-transform: uppercase;
		letter-spacing: 0.18em;
		font-size: 0.76rem;
		color: var(--site-muted);
	}

	h1 {
		font-family: var(--site-heading-font);
		font-size: clamp(2.6rem, 6vw, 5rem);
		line-height: 0.96;
		margin: 0.5rem 0 1rem;
	}

	.copy p:last-of-type {
		font-size: 1.05rem;
		line-height: 1.7;
		color: var(--site-muted);
	}

	img {
		width: 100%;
		border-radius: var(--site-radius);
		border: 1px solid var(--site-border);
		background: var(--site-surface);
	}

	.cta {
		display: inline-flex;
		margin-top: 1rem;
		padding: 0.9rem 1.2rem;
		border-radius: 999px;
		background: var(--site-accent);
		color: white;
		text-decoration: none;
	}

	@media (max-width: 800px) {
		.hero {
			grid-template-columns: 1fr;
		}
	}
</style>
