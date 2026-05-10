<script lang="ts">
	import RichTextPage from '$lib/components/site/RichTextPage.svelte';
	import SiteShell from '$lib/components/site/SiteShell.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<SiteShell
	theme={data.themeKey}
	siteName={data.snapshot.site.business.name}
	tagline={data.snapshot.site.business.tagline}
	navigation={data.snapshot.site.navigation}
	socialLinks={data.snapshot.site.socialLinks}
	activePath="/events"
>
	{#snippet children()}
		<RichTextPage
			title={data.event.title}
			excerpt={`${data.event.excerpt} · ${data.event.date} · ${data.event.location}`}
			html={data.event.html}
		/>
	{/snippet}
</SiteShell>
