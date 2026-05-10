<script lang="ts">
	import EntryPage from '$lib/components/site/EntryPage.svelte';
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
	activePath={`/${data.collection.routeBase}`}
>
	{#snippet children()}
		<EntryPage collection={data.collection} entry={data.entry} />
	{/snippet}
</SiteShell>
