import fs from 'node:fs/promises';
import path from 'node:path';
import {
	articleEntrySchema,
	collectionSchema,
	entrySchema,
	eventEntrySchema,
	galleryEntrySchema,
	pageSchema,
	siteSnapshotSchema,
	type SiteCollection,
	type SiteConfig,
	type SiteEntry,
	type SitePage,
	type SiteSnapshot
} from '$lib/types/content';
import { parseMarkdownDocument } from '$lib/utils/markdown-doc';

const contentDir = path.join(process.cwd(), 'content');

async function readMarkdownCollection<T extends SitePage | SiteEntry>(
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

async function readEntriesForCollection(collection: SiteCollection): Promise<SiteEntry[]> {
	const relativeDir = path.join('entries', collection.slug);
	const dir = path.join(contentDir, relativeDir);
	const entries = await fs.readdir(dir).catch(() => []);

	return Promise.all(
		entries
			.filter((entry) => entry.endsWith('.md') || entry.endsWith('.json'))
			.map(async (entry) => {
				const sourcePath = path.join('content', relativeDir, entry);
				const fullPath = path.join(dir, entry);

				if (collection.kind === 'gallery') {
					const raw = JSON.parse(await fs.readFile(fullPath, 'utf8')) as Record<string, unknown>;
					return galleryEntrySchema.parse({
						...raw,
						collectionSlug: collection.slug,
						sourcePath,
						html: parseMarkdownDocument(String(raw.body ?? '')).html
					});
				}

				const raw = await fs.readFile(fullPath, 'utf8');
				const parsed = parseMarkdownDocument(raw);
				const normalizedFrontmatter = Object.fromEntries(
					Object.entries(parsed.frontmatter).map(([key, value]) => [
						key,
						value instanceof Date ? value.toISOString().slice(0, 10) : value
					])
				);
				const base = {
					...(normalizedFrontmatter as Record<string, unknown>),
					collectionSlug: collection.slug,
					sourcePath,
					body: parsed.body,
					html: parsed.html
				};

				return collection.kind === 'event'
					? eventEntrySchema.parse({ ...base, kind: 'event' })
					: articleEntrySchema.parse({ ...base, kind: 'article' });
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
	const collections = await readJsonCollection('collections', (value) => collectionSchema.parse(value));
	const nestedEntries = await Promise.all(collections.map((collection) => readEntriesForCollection(collection)));
	const entries = nestedEntries.flat().map((entry) => entrySchema.parse(entry));

	return siteSnapshotSchema.parse({
		site,
		pages,
		collections,
		entries
	});
}
