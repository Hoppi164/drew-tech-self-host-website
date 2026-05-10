import type { UploadMeta } from '$lib/components/admin/types';
import { pendingDeletes, pendingUploads, type PendingUpload } from '$lib/stores/admin';
import type { ImageAsset, SiteGalleryEntry } from '$lib/types/content';
import { removeGalleryImageSnapshot } from '$lib/components/admin/workspace/snapshot';

export async function createPendingUpload(file: File, meta: UploadMeta) {
	const bytes = new Uint8Array(await file.arrayBuffer());
	const path = `static/uploads/${file.name}`;

	const upload: PendingUpload = {
		path,
		bytes,
		previewUrl: URL.createObjectURL(file),
		...meta
	};

	const item: ImageAsset = {
		src: `/${path.replace(/^static/, '')}`,
		alt: meta.alt,
		caption: meta.caption,
		tags: meta.tags,
		attribution: meta.attribution
	};

	return {
		upload,
		item
	};
}

export function queuePendingUpload(upload: PendingUpload) {
	pendingUploads.update((uploads) => [...uploads, upload]);
}

export function clearPendingDeletePath(path: string) {
	pendingDeletes.update((paths) => paths.filter((entry) => entry !== path));
}

export function removePendingUploadBySrc(src: string) {
	pendingUploads.update((uploads) =>
		uploads.filter((upload) => `/${upload.path.replace(/^static/, '')}` !== src)
	);
}

export function queueDeletePath(path: string) {
	pendingDeletes.update((paths) => Array.from(new Set([...paths, path])));
}

export function queueDeletePaths(pathsToAdd: string[]) {
	pendingDeletes.update((paths) => Array.from(new Set([...paths, ...pathsToAdd])));
}

export function deleteGalleryImageWorkflow(entry: SiteGalleryEntry, index: number) {
	const { deletePath, nextEntryPatch } = removeGalleryImageSnapshot(entry, index);
	removePendingUploadBySrc(entry.images[index].src);
	if (deletePath) {
		queueDeletePath(deletePath);
	}
	return nextEntryPatch;
}

export function clearPendingContentChanges() {
	pendingUploads.set([]);
	pendingDeletes.set([]);
}
