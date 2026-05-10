<script lang="ts">
	import CardGrid from '$lib/components/site/CardGrid.svelte';
	import SiteShell from '$lib/components/site/SiteShell.svelte';
	import { sortByDateDescending } from '$lib/content/site';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const events = $derived(sortByDateDescending(data.snapshot.events));
</script>

<SiteShell
	theme={data.snapshot.site.theme.global}
	siteName={data.snapshot.site.business.name}
	tagline={data.snapshot.site.business.tagline}
	navigation={data.snapshot.site.navigation}
	socialLinks={data.snapshot.site.socialLinks}
	activePath="/events"
>
	{#snippet children()}
		<CardGrid title="Events" items={events} hrefPrefix="/events" />
	{/snippet}
</SiteShell>
