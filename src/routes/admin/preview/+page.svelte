<script lang="ts">
	import SnapshotPreview from '$lib/components/preview/SnapshotPreview.svelte';
	import { adminSelection, adminSnapshot } from '$lib/stores/admin';
	import { get } from 'svelte/store';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const snapshot = $derived(get(adminSnapshot) ?? data.initialSnapshot);
	const selection = $derived(
		get(adminSelection) ?? { type: data.type, slug: data.slug, collectionSlug: data.collectionSlug }
	);
</script>

<SnapshotPreview
	snapshot={snapshot}
	type={selection.type}
	slug={selection.slug}
	collectionSlug={selection.collectionSlug}
/>
