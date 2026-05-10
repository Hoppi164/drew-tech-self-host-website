<script lang="ts">
	import CardGrid from '$lib/components/site/CardGrid.svelte';
	import SiteShell from '$lib/components/site/SiteShell.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<SiteShell
	theme={data.snapshot.site.theme.global}
	siteName={data.snapshot.site.business.name}
	tagline={data.snapshot.site.business.tagline}
	navigation={data.snapshot.site.navigation}
	socialLinks={data.snapshot.site.socialLinks}
	activePath="/collections"
>
	{#snippet children()}
		<CardGrid title="Collections" items={data.snapshot.collections} hrefPrefix="/collections" />
	{/snippet}
</SiteShell>
