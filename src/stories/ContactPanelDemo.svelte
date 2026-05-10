<script lang="ts">
	import ContactPanel from '$lib/components/site/ContactPanel.svelte';
	import ThemeFrame from '$lib/components/storybook/ThemeFrame.svelte';
	import type { ThemeKey } from '$lib/types/theme';

	type Props = {
		theme: ThemeKey;
	};

	let { theme }: Props = $props();
</script>

<ThemeFrame {theme} title="ContactPanel">
	{#snippet children()}
		<ContactPanel
			title="Start with a simple conversation"
			intro="Use email, phone, or a static form endpoint once you are ready to accept enquiries."
			email="hello@example.com"
			phone="+61 7 5555 0110"
			address="West End, Brisbane"
			ctaLabel="Email now"
			ctaUrl="mailto:hello@example.com"
		/>
	{/snippet}
</ThemeFrame>
