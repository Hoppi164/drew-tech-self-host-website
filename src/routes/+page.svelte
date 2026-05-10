<script lang="ts">
	import HomePage from '$lib/components/site/HomePage.svelte';
	import SiteShell from '$lib/components/site/SiteShell.svelte';
	import { homepageData } from '$lib/content/site';
	import { themes } from '$lib/types/theme';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const home = $derived(homepageData(data.snapshot));
	const theme = $derived(data.snapshot.site.theme.global);
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
		<HomePage
			title={data.snapshot.site.business.name}
			tagline={data.snapshot.site.business.tagline}
			description={data.snapshot.site.business.description}
			heroImage={home.gallery?.coverImage ?? '/uploads/artist-studio.svg'}
			heroCtaLabel={data.snapshot.site.homepage.heroCtaLabel}
			heroCtaPath={data.snapshot.site.homepage.heroCtaPath}
			pages={home.pages}
			collections={home.collections}
			posts={home.posts}
			events={home.events}
			gallery={home.gallery}
			heroAlign={themes[theme].heroAlign}
		/>
	{/snippet}
</SiteShell>
