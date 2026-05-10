import type { ConfirmState } from '$lib/components/admin/types';

export function getConfirmCopy(confirmState: ConfirmState | null) {
	if (!confirmState) return { title: '', description: '', confirmLabel: 'Confirm' };

	switch (confirmState.kind) {
		case 'page':
			return {
				title: 'Delete Page?',
				description: `This will remove "${confirmState.page.title}" from the site and delete its content file on the next publish.`,
				confirmLabel: 'Delete Page'
			};
		case 'collection':
			return {
				title: 'Delete Collection?',
				description: `This will remove "${confirmState.collection.title}" and all of its entries from the site on the next publish.`,
				confirmLabel: 'Delete Collection'
			};
		case 'entry':
			return {
				title: 'Delete Entry?',
				description: `This will remove "${confirmState.entry.title}" from its collection and delete its content file on the next publish.`,
				confirmLabel: 'Delete Entry'
			};
		case 'image':
			return {
				title: 'Delete Image?',
				description: `This will remove "${confirmState.image.alt}" from the gallery entry and queue the underlying asset for deletion on the next publish.`,
				confirmLabel: 'Delete Image'
			};
	}
}
