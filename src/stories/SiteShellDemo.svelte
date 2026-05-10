<script lang="ts">
	import SiteShell from '$lib/components/site/SiteShell.svelte';
	import type { ThemeKey } from '$lib/types/theme';
	import { navigation, socialLinks } from './fixtures';

	type Props = {
		theme: ThemeKey;
	};

	let { theme }: Props = $props();
</script>

<SiteShell
	{theme}
	siteName="Northwind Studio"
	tagline="Distinct static sites for small businesses."
	{navigation}
	{socialLinks}
	activePath="/about"
>
	{#snippet children()}
		<section class="panel">
			<h2>Shell Content</h2>
			<p>
				This story isolates the navigation, footer, typography, and overall theme surface.
			</p>
		</section>
	{/snippet}
</SiteShell>

<style>
	.panel {
		background: var(--site-surface);
		border: 1px solid var(--site-border);
		border-radius: var(--site-radius);
		padding: 2rem;
		box-shadow: var(--site-shadow);
	}

	h2 {
		margin: 0 0 0.75rem;
		font-family: var(--site-heading-font);
		font-size: 2rem;
	}

	p {
		margin: 0;
		line-height: 1.7;
		color: var(--site-muted);
	}
</style>
