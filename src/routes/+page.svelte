<script lang="ts">
	import ContactPanel from '$lib/components/site/ContactPanel.svelte';
	import RichTextPage from '$lib/components/site/RichTextPage.svelte';
	import SiteShell from '$lib/components/site/SiteShell.svelte';
	import { getHomePage } from '$lib/content/site';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const theme = $derived(data.snapshot.site.theme.global);
	const homePage = $derived(getHomePage(data.snapshot));
</script>

<SiteShell
	theme={theme}
	siteName={data.snapshot.site.business.name}
	tagline={data.snapshot.site.business.tagline}
	navigation={data.snapshot.site.navigation}
	socialLinks={data.snapshot.site.socialLinks}
	activePath="/"
>
	{#snippet children()}
		{#if homePage?.slug === 'contact'}
			<ContactPanel {...data.snapshot.site.contact} />
		{:else if homePage}
			<RichTextPage
				title={homePage.title}
				excerpt={homePage.excerpt}
				html={homePage.html}
				showTitle={homePage.showTitle}
			/>
		{/if}
	{/snippet}
</SiteShell>
