<script lang="ts">
	import '$lib/styles/themes/index.css';
	import type { ThemeKey } from '$lib/types/theme';

	type Props = {
		theme: ThemeKey;
		title?: string;
		children: import('svelte').Snippet;
	};

	let { theme, title = '', children }: Props = $props();
</script>

<div class="frame theme-scope" data-theme={theme}>
	{#if title}
		<header>
			<span>{theme}</span>
			<h2>{title}</h2>
		</header>
	{/if}
	<div class="surface">
		{@render children()}
	</div>
</div>

<style>
	.frame {
		min-height: 100vh;
		padding: 1.5rem;
		background:
			var(--site-hero-glow),
			var(--site-background);
		color: var(--site-text);
		font-family: var(--site-body-font);
		--site-background: #f6f1e7;
		--site-surface: #fffaf5;
		--site-text: #241f1b;
		--site-muted: #6d6257;
		--site-accent: #af5a43;
		--site-border: #dccab5;
		--site-radius: 24px;
		--site-heading-font: Georgia, serif;
		--site-body-font: 'Segoe UI', sans-serif;
		--site-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
		--site-hero-glow: radial-gradient(circle at top left, rgba(175, 90, 67, 0.12), transparent 32%);
	}

	header {
		display: grid;
		gap: 0.2rem;
		margin-bottom: 1rem;
	}

	span {
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.16em;
		color: var(--site-muted);
	}

	h2 {
		margin: 0;
		font-family: var(--site-heading-font);
		font-size: 2rem;
	}

	.surface {
		max-width: 1120px;
		margin: 0 auto;
	}
</style>
