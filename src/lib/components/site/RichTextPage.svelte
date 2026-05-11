<script lang="ts">
	type Props = {
		title: string;
		excerpt: string;
		html: string;
		showTitle?: boolean;
	};

	let { title, excerpt, html, showTitle = true }: Props = $props();
</script>

<article class="article">
	<header>
		<p>{excerpt}</p>
		{#if showTitle}
			<h1>{title}</h1>
		{/if}
	</header>
	<div class="prose">{@html html}</div>
</article>

<style>
	.article {
		background: var(--site-surface);
		border: 1px solid var(--site-border);
		border-radius: var(--site-radius);
		padding: 2rem;
	}

	header p {
		color: var(--site-muted);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-size: 0.76rem;
	}

	h1 {
		font-family: var(--site-heading-font);
		font-size: clamp(2.2rem, 5vw, 4rem);
		margin: 0 0 1.5rem;
	}

	.prose :global(p) {
		line-height: 1.8;
		color: var(--site-text);
	}
</style>
