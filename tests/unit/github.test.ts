import { describe, expect, it, vi } from 'vitest';
import { isFineGrainedPat, validateToken } from '$lib/github/api';

describe('github helpers', () => {
	it('recognizes fine-grained PATs', () => {
		expect(isFineGrainedPat('github_pat_123')).toBe(true);
		expect(isFineGrainedPat('ghp_legacy')).toBe(false);
	});

	it('validates repo access through the GitHub API', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ default_branch: 'main', full_name: 'demo/repo', html_url: 'https://github.com/demo/repo' })
		});
		vi.stubGlobal('fetch', fetchMock);

		const result = await validateToken('github_pat_123', {
			owner: 'demo',
			name: 'repo',
			branch: 'main'
		});

		expect(result.default_branch).toBe('main');
		expect(fetchMock).toHaveBeenCalledOnce();
	});
});
