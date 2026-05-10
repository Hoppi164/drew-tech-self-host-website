<script lang="ts">
	import CardGrid from '$lib/components/site/CardGrid.svelte';
	import SiteShell from '$lib/components/site/SiteShell.svelte';
	import { sortByDateDescending } from '$lib/content/site';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const posts = $derived(sortByDateDescending(data.snapshot.posts));
</script>

<SiteShell
	theme={data.snapshot.site.theme.global}
	siteName={data.snapshot.site.business.name}
	tagline={data.snapshot.site.business.tagline}
	navigation={data.snapshot.site.navigation}
	socialLinks={data.snapshot.site.socialLinks}
	activePath="/posts"
>
	{#snippet children()}
		<CardGrid title="Journal" items={posts} hrefPrefix="/posts" />
	{/snippet}
</SiteShell>
