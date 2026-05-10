<script lang="ts">
	import ThemeFrame from '$lib/components/storybook/ThemeFrame.svelte';
	import type { ThemeKey } from '$lib/types/theme';

	type Props = {
		theme: ThemeKey;
	};

	let { theme }: Props = $props();
</script>

<ThemeFrame {theme} title="HTML Primitives">
	{#snippet children()}
		<section class="panel">
			<h1>Heading One</h1>
			<p>
				This shows how a theme affects raw text, a <a href="/">link</a>, and regular spacing
				without a component abstraction.
			</p>
			<blockquote>Useful for checking the feel of editorial pages before content is written.</blockquote>
			<ul>
				<li>Heading hierarchy</li>
				<li>Body typography</li>
				<li>Buttons, inputs, and borders</li>
			</ul>
			<div class="controls">
				<button class="cta" type="button">Primary action</button>
				<input placeholder="Email address" />
			</div>
		</section>
	{/snippet}
</ThemeFrame>

<style>
	.panel {
		background: var(--site-surface);
		border: 1px solid var(--site-border);
		border-radius: var(--site-radius);
		padding: 2rem;
		box-shadow: var(--site-shadow);
	}

	h1 {
		margin: 0 0 1rem;
		font-family: var(--site-heading-font);
		font-size: clamp(2rem, 4vw, 3.6rem);
	}

	p,
	li,
	blockquote {
		line-height: 1.75;
		color: var(--site-text);
	}

	blockquote {
		margin: 1rem 0;
		padding-left: 1rem;
		border-left: 4px solid var(--site-accent);
		color: var(--site-muted);
	}

	a {
		color: var(--site-accent);
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	button,
	input {
		font: inherit;
	}

	input {
		padding: 0.9rem 1rem;
		border-radius: 999px;
		border: 1px solid var(--site-border);
		background: transparent;
		color: var(--site-text);
	}

	.cta {
		padding: 0.9rem 1.2rem;
		border: 0;
		border-radius: 999px;
		background: var(--site-accent);
		color: white;
	}
</style>
