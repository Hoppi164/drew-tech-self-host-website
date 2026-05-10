import fs from 'node:fs/promises';
import path from 'node:path';
import { collectionSchema, eventSchema, gallerySchema, pageSchema, postSchema, siteSnapshotSchema, type SiteConfig, type SiteEvent, type SitePage, type SitePost, type SiteSnapshot } from '$lib/types/content';
import { parseMarkdownDocument } from '$lib/utils/markdown-doc';

const contentDir = path.join(process.cwd(), 'content');

async function readMarkdownCollection<T extends SitePage | SitePost | SiteEvent>(
	relativeDir: string,
	transform: (value: Record<string, unknown> & { body: string; html: string; sourcePath: string }) => T
) {
	const dir = path.join(contentDir, relativeDir);
	const entries = await fs.readdir(dir);
	return Promise.all(
		entries
			.filter((entry) => entry.endsWith('.md'))
			.map(async (entry) => {
				const sourcePath = path.join('content', relativeDir, entry);
				const raw = await fs.readFile(path.join(dir, entry), 'utf8');
				const parsed = parseMarkdownDocument(raw);
				const normalizedFrontmatter = Object.fromEntries(
					Object.entries(parsed.frontmatter).map(([key, value]) => [
						key,
						value instanceof Date ? value.toISOString().slice(0, 10) : value
					])
				);
				return transform({
					...(normalizedFrontmatter as Record<string, unknown>),
					body: parsed.body,
					html: parsed.html,
					sourcePath
				});
			})
	);
}

async function readJsonCollection<T>(
	relativeDir: string,
	transform: (value: Record<string, unknown> & { sourcePath: string }) => T
) {
	const dir = path.join(contentDir, relativeDir);
	const entries = await fs.readdir(dir);
	return Promise.all(
		entries
			.filter((entry) => entry.endsWith('.json'))
			.map(async (entry) => {
				const sourcePath = path.join('content', relativeDir, entry);
				const raw = await fs.readFile(path.join(dir, entry), 'utf8');
				return transform({
					...(JSON.parse(raw) as Record<string, unknown>),
					sourcePath
				});
			})
	);
}

export async function getSiteSnapshot(): Promise<SiteSnapshot> {
	const siteRaw = JSON.parse(await fs.readFile(path.join(contentDir, 'site.json'), 'utf8')) as Record<string, unknown>;
	const site = siteSnapshotSchema.shape.site.parse({
		...siteRaw,
		sourcePath: 'content/site.json'
	}) as SiteConfig;
	const pages = await readMarkdownCollection('pages', (value) => pageSchema.parse(value));
	const posts = await readMarkdownCollection('posts', (value) => postSchema.parse(value));
	const events = await readMarkdownCollection('events', (value) => eventSchema.parse(value));
	const galleries = await readJsonCollection('galleries', (value) => gallerySchema.parse(value));
	const collections = await readJsonCollection('collections', (value) => collectionSchema.parse(value));

	return siteSnapshotSchema.parse({
		site,
		pages,
		posts,
		events,
		galleries,
		collections
	});
}
