<script lang="ts">
	import CollectionPage from '$lib/components/site/CollectionPage.svelte';
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
	activePath={data.view === 'collection' ? `/${data.collection.routeBase}` : `/${data.page.slug}`}
>
	{#snippet children()}
		{#if data.view === 'page'}
			<RichTextPage
				title={data.page.title}
				excerpt={data.page.excerpt}
				html={data.page.html}
				showTitle={data.page.showTitle}
			/>
		{:else}
			<CollectionPage collection={data.collection} entries={data.entries} />
		{/if}
	{/snippet}
</SiteShell>
