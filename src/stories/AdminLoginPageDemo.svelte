<script lang="ts">
	import AdminLoginPage from '$lib/components/admin/AdminLoginPage.svelte';
	import type { GithubLinks } from '$lib/components/admin/types';

	let token = $state('');

	const githubLinks: GithubLinks = {
		repo: 'https://github.com/example/self-host-website',
		actions: 'https://github.com/example/self-host-website/actions',
		pages: 'https://github.com/example/self-host-website/settings/pages',
		token:
			'https://github.com/settings/personal-access-tokens/new?name=self-host-website&description=token-used-to-authenticate-admin-user-on-self-hosted-website&expires_in=none&contents=write&metadata=read',
		settings: 'https://github.com/example/self-host-website/settings'
	};
</script>

<AdminLoginPage
	error=""
	{githubLinks}
	onSubmit={() => undefined}
	onTokenChange={(value) => (token = value)}
	status="Logged in. Token is stored in memory only for this tab."
	{token}
/>
