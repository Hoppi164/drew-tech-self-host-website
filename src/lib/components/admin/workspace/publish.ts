import { get } from 'svelte/store';
import { publishSnapshot, type RepoConfig } from '$lib/github/api';
import { adminToken, pendingDeletes, pendingUploads } from '$lib/stores/admin';
import type { SiteSnapshot } from '$lib/types/content';
import { clearPendingContentChanges } from '$lib/components/admin/workspace/media';

type PublishResult =
	| { ok: true; status: string }
	| { ok: false; error: string; status?: string };

export async function publishAdminSnapshot(
	repo: RepoConfig,
	snapshot: SiteSnapshot
): Promise<PublishResult> {
	const currentToken = get(adminToken);
	if (!currentToken) {
		return {
			ok: false,
			error: 'Log in with a valid token before publishing.'
		};
	}

	try {
		await publishSnapshot(currentToken, repo, snapshot, get(pendingUploads), get(pendingDeletes));
		clearPendingContentChanges();
		return {
			ok: true,
			status: 'Published. GitHub Actions should rebuild the site shortly.'
		};
	} catch (caught) {
		return {
			ok: false,
			error: caught instanceof Error ? caught.message : 'Publish failed.'
		};
	}
}
