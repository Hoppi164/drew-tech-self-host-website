import { writable } from 'svelte/store';
import type { EditableEntityType, SiteSnapshot } from '$lib/types/content';

export type AdminSelection = {
	type: EditableEntityType | 'site';
	slug: string;
	collectionSlug?: string;
};

export type PendingUpload = {
	path: string;
	bytes: Uint8Array;
	previewUrl: string;
	alt: string;
	caption: string;
	tags: string[];
	attribution: string;
};

export const adminSnapshot = writable<SiteSnapshot | null>(null);
export const adminSelection = writable<AdminSelection>({ type: 'site', slug: 'site' });
export const adminToken = writable<string | null>(null);
export const pendingUploads = writable<PendingUpload[]>([]);
export const pendingDeletes = writable<string[]>([]);
