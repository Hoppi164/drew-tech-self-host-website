import type {
	EditableEntityType,
	ImageAsset,
	SiteCollection,
	SiteEntry,
	SiteGalleryEntry,
	SitePage
} from '$lib/types/content';

export type AdminViewType = EditableEntityType | 'site';

export type GithubLinks = {
	repo: string;
	actions: string;
	pages: string;
	token: string;
	settings: string;
};

export type PreviewSelection = {
	type: AdminViewType;
	slug: string;
	collectionSlug?: string;
};

export type CollectionGroup = {
	collection: SiteCollection;
	entries: SiteEntry[];
};

export type ConfirmState =
	| { kind: 'page'; page: SitePage }
	| { kind: 'collection'; collection: SiteCollection }
	| { kind: 'entry'; entry: SiteEntry }
	| { kind: 'image'; entry: SiteGalleryEntry; index: number; image: ImageAsset };

export type UploadMeta = {
	alt: string;
	caption: string;
	tags: string[];
	attribution: string;
};
