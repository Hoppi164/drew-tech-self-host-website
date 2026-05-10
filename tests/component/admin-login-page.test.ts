import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import AdminLoginPage from '$lib/components/admin/AdminLoginPage.svelte';
import type { GithubLinks } from '$lib/components/admin/types';

const githubLinks: GithubLinks = {
	repo: 'https://github.com/example/self-host-website',
	actions: 'https://github.com/example/self-host-website/actions',
	pages: 'https://github.com/example/self-host-website/settings/pages',
	token:
		'https://github.com/settings/personal-access-tokens/new?name=self-host-website&description=token-used-to-authenticate-admin-user-on-self-hosted-website&expires_in=none&contents=write&metadata=read',
	settings: 'https://github.com/example/self-host-website/settings'
};

describe('AdminLoginPage', () => {
	it('renders the login UI and forwards token input and submit', async () => {
		const handleTokenChange = vi.fn();
		const handleSubmit = vi.fn();

		render(AdminLoginPage, {
			token: '',
			error: '',
			status: '',
			githubLinks,
			onTokenChange: handleTokenChange,
			onSubmit: handleSubmit
		});

		expect(screen.getByRole('heading', { name: 'Admin Login' })).toBeTruthy();

		await fireEvent.input(screen.getByLabelText('Github PAT'), {
			target: { value: 'github_pat_example' }
		});
		await fireEvent.click(screen.getByRole('button', { name: 'Log In to CMS' }));

		expect(handleTokenChange).toHaveBeenCalledWith('github_pat_example');
		expect(handleSubmit).toHaveBeenCalledOnce();
	});
});
