<script lang="ts">
	import ContactPanel from '$lib/components/site/ContactPanel.svelte';
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
	activePath={`/${data.page.slug}`}
>
	{#snippet children()}
		{#if data.page.slug === 'contact'}
			<ContactPanel {...data.snapshot.site.contact} />
		{:else}
			<RichTextPage title={data.page.title} excerpt={data.page.excerpt} html={data.page.html} />
		{/if}
	{/snippet}
</SiteShell>
