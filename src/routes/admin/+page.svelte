<script lang="ts">
	import AdminWorkspace from '$lib/components/admin/AdminWorkspace.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<AdminWorkspace initialSnapshot={data.initialSnapshot} />
