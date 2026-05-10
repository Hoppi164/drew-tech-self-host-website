import { serializeSnapshot } from '$lib/content/site';
import type { SiteSnapshot } from '$lib/types/content';

export type RepoConfig = {
	owner: string;
	name: string;
	branch: string;
};

type GithubFileResponse = {
	content?: string;
	encoding?: string;
};

type GitRefResponse = {
	object: {
		sha: string;
	};
};

type GitCommitResponse = {
	sha: string;
	tree: {
		sha: string;
	};
};

type PublishUpload = {
	path: string;
	bytes: Uint8Array;
};

type PublishCandidate = {
	path: string;
	content: string;
	encoding: 'utf-8' | 'base64';
};

function authHeaders(token: string) {
	return {
		Accept: 'application/vnd.github+json',
		Authorization: `Bearer ${token}`,
		'X-GitHub-Api-Version': '2022-11-28'
	};
}

function toBase64(content: string) {
	return btoa(unescape(encodeURIComponent(content)));
}

function binaryToBase64(bytes: Uint8Array) {
	const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
	return btoa(binary);
}

function decodeBase64Content(content: string) {
	return decodeURIComponent(escape(atob(content.replace(/\n/g, ''))));
}

async function getJson<T>(token: string, url: string) {
	const response = await fetch(url, {
		headers: authHeaders(token)
	});

	if (!response.ok) {
		const details = await response.text();
		throw new Error(`GitHub request failed for ${url} (${response.status}): ${details || response.statusText}`);
	}

	return (await response.json()) as T;
}

async function postJson<T>(token: string, url: string, body: Record<string, unknown>) {
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			...authHeaders(token),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		const details = await response.text();
		throw new Error(`GitHub request failed for ${url} (${response.status}): ${details || response.statusText}`);
	}

	return (await response.json()) as T;
}

async function patchJson<T>(token: string, url: string, body: Record<string, unknown>) {
	const response = await fetch(url, {
		method: 'PATCH',
		headers: {
			...authHeaders(token),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		const details = await response.text();
		throw new Error(`GitHub request failed for ${url} (${response.status}): ${details || response.statusText}`);
	}

	return (await response.json()) as T;
}

async function readRepoFile(token: string, repo: RepoConfig, filePath: string) {
	const response = await fetch(
		`https://api.github.com/repos/${repo.owner}/${repo.name}/contents/${filePath}?ref=${repo.branch}`,
		{
			headers: authHeaders(token)
		}
	);

	if (response.status === 404) {
		return undefined;
	}

	if (!response.ok) {
		throw new Error(`Failed to read ${filePath} from GitHub.`);
	}

	const data = (await response.json()) as GithubFileResponse;
	if (!data.content || data.encoding !== 'base64') {
		throw new Error(`Unexpected GitHub content response for ${filePath}.`);
	}

	return decodeBase64Content(data.content);
}

async function createBlob(token: string, repo: RepoConfig, content: string, encoding: 'utf-8' | 'base64') {
	const response = await postJson<{ sha: string }>(
		token,
		`https://api.github.com/repos/${repo.owner}/${repo.name}/git/blobs`,
		{ content, encoding }
	);

	return response.sha;
}

async function getBranchHead(token: string, repo: RepoConfig) {
	return getJson<GitRefResponse>(
		token,
		`https://api.github.com/repos/${repo.owner}/${repo.name}/git/ref/heads/${repo.branch}`
	);
}

async function getCommit(token: string, repo: RepoConfig, commitSha: string) {
	return getJson<GitCommitResponse>(
		token,
		`https://api.github.com/repos/${repo.owner}/${repo.name}/git/commits/${commitSha}`
	);
}

async function createTree(
	token: string,
	repo: RepoConfig,
	baseTreeSha: string,
	entries: { path: string; mode: '100644'; type: 'blob'; sha: string }[]
) {
	return postJson<{ sha: string }>(token, `https://api.github.com/repos/${repo.owner}/${repo.name}/git/trees`, {
		base_tree: baseTreeSha,
		tree: entries
	});
}

async function createCommit(
	token: string,
	repo: RepoConfig,
	message: string,
	treeSha: string,
	parentSha: string
) {
	return postJson<{ sha: string }>(token, `https://api.github.com/repos/${repo.owner}/${repo.name}/git/commits`, {
		message,
		tree: treeSha,
		parents: [parentSha]
	});
}

async function updateBranchHead(token: string, repo: RepoConfig, commitSha: string) {
	return patchJson<GitRefResponse>(
		token,
		`https://api.github.com/repos/${repo.owner}/${repo.name}/git/refs/heads/${repo.branch}`,
		{ sha: commitSha }
	);
}

function buildPublishCandidates(snapshot: SiteSnapshot, pendingUploads: PublishUpload[]): PublishCandidate[] {
	const serialized = serializeSnapshot(snapshot);

	return [
		{ path: 'content/site.json', content: serialized.site, encoding: 'utf-8' as const },
		...serialized.pages.map((page) => ({ path: page.path, content: page.content, encoding: 'utf-8' as const })),
		...serialized.posts.map((post) => ({ path: post.path, content: post.content, encoding: 'utf-8' as const })),
		...serialized.events.map((event) => ({ path: event.path, content: event.content, encoding: 'utf-8' as const })),
		...serialized.galleries.map((gallery) => ({
			path: gallery.path,
			content: gallery.content,
			encoding: 'utf-8' as const
		})),
		...serialized.collections.map((collection) => ({
			path: collection.path,
			content: collection.content,
			encoding: 'utf-8' as const
		})),
		...pendingUploads.map((upload) => ({
			path: upload.path,
			content: binaryToBase64(upload.bytes),
			encoding: 'base64' as const
		}))
	];
}

async function filterChangedCandidates(token: string, repo: RepoConfig, candidates: PublishCandidate[]) {
	const changed: PublishCandidate[] = [];

	for (const candidate of candidates) {
		const existing = await readRepoFile(token, repo, candidate.path);
		const nextContent =
			candidate.encoding === 'base64' ? decodeBase64Content(candidate.content) : candidate.content;

		if (existing !== nextContent) {
			changed.push(candidate);
		}
	}

	return changed;
}

export function isFineGrainedPat(token: string) {
	return token.startsWith('github_pat_');
}

export async function validateToken(token: string, repo: RepoConfig) {
	const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}`, {
		headers: authHeaders(token)
	});

	if (!response.ok) {
		throw new Error('Unable to access the configured repository with this token.');
	}

	return response.json() as Promise<{ default_branch: string; html_url: string; full_name: string }>;
}

export async function publishSnapshot(
	token: string,
	repo: RepoConfig,
	snapshot: SiteSnapshot,
	pendingUploads: PublishUpload[]
) {
	const candidates = buildPublishCandidates(snapshot, pendingUploads);
	const changedCandidates = await filterChangedCandidates(token, repo, candidates);

	if (!changedCandidates.length) {
		return;
	}

	const head = await getBranchHead(token, repo);
	const parentSha = head.object.sha;
	const commit = await getCommit(token, repo, parentSha);

	const treeEntries = [];
	for (const candidate of changedCandidates) {
		const blobSha = await createBlob(token, repo, candidate.content, candidate.encoding);
		treeEntries.push({
			path: candidate.path,
			mode: '100644' as const,
			type: 'blob' as const,
			sha: blobSha
		});
	}

	const tree = await createTree(token, repo, commit.tree.sha, treeEntries);
	const nextCommit = await createCommit(
		token,
		repo,
		`content: publish ${changedCandidates.length} update${changedCandidates.length === 1 ? '' : 's'}`,
		tree.sha,
		parentSha
	);

	await updateBranchHead(token, repo, nextCommit.sha);
}
