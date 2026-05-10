<script lang="ts">
	import RichTextPage from '$lib/components/site/RichTextPage.svelte';
	import ThemeFrame from '$lib/components/storybook/ThemeFrame.svelte';
	import type { ThemeKey } from '$lib/types/theme';

	type Props = {
		theme: ThemeKey;
	};

	let { theme }: Props = $props();
</script>

<ThemeFrame {theme} title="RichTextPage">
	{#snippet children()}
		<RichTextPage
			title="About Northwind"
			excerpt="A flexible story page for any small business."
			html="<p>This story shows long-form copy inside the reusable page renderer.</p><p>The same component drives public pages and admin previews.</p>"
		/>
	{/snippet}
</ThemeFrame>
