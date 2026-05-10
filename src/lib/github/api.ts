import { serializeSnapshot } from '$lib/content/site';
import type { SiteSnapshot } from '$lib/types/content';

export type RepoConfig = {
	owner: string;
	name: string;
	branch: string;
};

type GithubFileResponse = {
	sha: string;
	content?: string;
	encoding?: string;
};

function authHeaders(token: string) {
	return {
		Accept: 'application/vnd.github+json',
		Authorization: `Bearer ${token}`,
		'X-GitHub-Api-Version': '2022-11-28'
	};
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

export async function getFileSha(token: string, repo: RepoConfig, filePath: string) {
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
	return data.sha;
}

export async function putTextFile(
	token: string,
	repo: RepoConfig,
	filePath: string,
	content: string,
	message: string
) {
	const sha = await getFileSha(token, repo, filePath);
	const body = {
		message,
		content: btoa(unescape(encodeURIComponent(content))),
		branch: repo.branch,
		...(sha ? { sha } : {})
	};

	const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/contents/${filePath}`, {
		method: 'PUT',
		headers: {
			...authHeaders(token),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		throw new Error(`Failed to save ${filePath}.`);
	}
}

export async function putBinaryFile(
	token: string,
	repo: RepoConfig,
	filePath: string,
	bytes: Uint8Array,
	message: string
) {
	const sha = await getFileSha(token, repo, filePath);
	const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
	const body = {
		message,
		content: btoa(binary),
		branch: repo.branch,
		...(sha ? { sha } : {})
	};

	const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/contents/${filePath}`, {
		method: 'PUT',
		headers: {
			...authHeaders(token),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		throw new Error(`Failed to upload ${filePath}.`);
	}
}

export async function publishSnapshot(
	token: string,
	repo: RepoConfig,
	snapshot: SiteSnapshot,
	pendingUploads: { path: string; bytes: Uint8Array }[]
) {
	const serialized = serializeSnapshot(snapshot);

	await putTextFile(token, repo, 'content/site.json', serialized.site, 'chore: update site settings');

	for (const page of serialized.pages) {
		await putTextFile(token, repo, page.path, page.content, `content: update page ${page.path}`);
	}

	for (const post of serialized.posts) {
		await putTextFile(token, repo, post.path, post.content, `content: update post ${post.path}`);
	}

	for (const event of serialized.events) {
		await putTextFile(token, repo, event.path, event.content, `content: update event ${event.path}`);
	}

	for (const gallery of serialized.galleries) {
		await putTextFile(token, repo, gallery.path, gallery.content, `content: update gallery ${gallery.path}`);
	}

	for (const collection of serialized.collections) {
		await putTextFile(
			token,
			repo,
			collection.path,
			collection.content,
			`content: update collection ${collection.path}`
		);
	}

	for (const upload of pendingUploads) {
		await putBinaryFile(token, repo, upload.path, upload.bytes, `media: upload ${upload.path}`);
	}
}
