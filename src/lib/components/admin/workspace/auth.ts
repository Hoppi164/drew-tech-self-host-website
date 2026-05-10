import type { GithubLinks } from '$lib/components/admin/types';
import { isFineGrainedPat, validateToken, type RepoConfig } from '$lib/github/api';
import { adminToken } from '$lib/stores/admin';

type UnlockResult =
	| { ok: true }
	| {
			ok: false;
			error: string;
	  };

export function createGithubLinks(repo: RepoConfig): GithubLinks {
	return {
		repo: `https://github.com/${repo.owner}/${repo.name}`,
		actions: `https://github.com/${repo.owner}/${repo.name}/actions`,
		pages: `https://github.com/${repo.owner}/${repo.name}/settings/pages`,
		token:
			'https://github.com/settings/personal-access-tokens/new?name=self-host-website&description=token-used-to-authenticate-admin-user-on-self-hosted-website&expires_in=none&contents=write&metadata=read',
		settings: `https://github.com/${repo.owner}/${repo.name}/settings`
	};
}

export async function unlockAdminSession(token: string, repo: RepoConfig): Promise<UnlockResult> {
	if (!isFineGrainedPat(token)) {
		return {
			ok: false,
			error: 'Use a fine-grained GitHub PAT that starts with github_pat_.'
		};
	}

	try {
		await validateToken(token, repo);
		adminToken.set(token);
		return { ok: true };
	} catch (caught) {
		return {
			ok: false,
			error: caught instanceof Error ? caught.message : 'Failed to validate token.'
		};
	}
}

export function lockAdminSession() {
	adminToken.set(null);
	return {
		token: '',
		status: '',
		error: '',
		unlocked: false
	};
}
