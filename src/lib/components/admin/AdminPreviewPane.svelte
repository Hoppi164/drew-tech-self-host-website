<script lang="ts">
	import SnapshotPreview from '$lib/components/preview/SnapshotPreview.svelte';
	import type { AdminViewType, PreviewSelection } from '$lib/components/admin/types';
	import type { SiteSnapshot } from '$lib/types/content';

	type Props = {
		snapshot: SiteSnapshot;
		type: AdminViewType;
		slug: string;
		collectionSlug?: string;
		status: string;
		error: string;
		onOpenPreview: () => void;
		onPublish: () => void;
		onNavigatePreview?: ((selection: PreviewSelection) => void) | undefined;
	};

	let {
		snapshot,
		type,
		slug,
		collectionSlug,
		status,
		error,
		onOpenPreview,
		onPublish,
		onNavigatePreview
	}: Props = $props();
</script>

<section class="preview-card">
	<div class="preview-card-head">
		<div>
			<p class="eyebrow">Live Preview</p>
			{#if status}<p class="status-inline">{status}</p>{/if}
			{#if error}<p class="status-inline error">{error}</p>{/if}
		</div>
		<div class="preview-actions">
			<button class="ghost" onclick={onOpenPreview} type="button">Open Full Preview</button>
			<button class="primary publish-button" onclick={onPublish} type="button">
				<img alt="" aria-hidden="true" src="https://github.com/favicon.ico" />
				<span>Publish to GitHub</span>
			</button>
		</div>
	</div>
	<div class="preview-frame">
		<SnapshotPreview {snapshot} {type} {slug} {collectionSlug} onNavigate={onNavigatePreview} />
	</div>
</section>

<style>
	.preview-card {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		gap: 0.9rem;
		height: 100%;
		min-height: 0;
		padding: 1.25rem;
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(14px);
		border: 1px solid #d9deea;
		border-right: 0;
		border-radius: 30px 0 0 30px;
		box-shadow: 0 30px 80px rgba(25, 39, 58, 0.12);
	}

	.preview-card-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.preview-card-head > div:first-child {
		display: grid;
		align-content: center;
		gap: 0.35rem;
	}

	.preview-card-head p {
		color: #617086;
	}

	.preview-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.eyebrow {
		margin: 0;
		font-size: 0.92rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: #5d6f8a;
	}

	.status-inline {
		margin: 0;
		color: #617086;
	}

	.error {
		color: #9f2435;
	}

	.preview-frame {
		border-radius: 24px 0 0 24px;
		overflow: auto;
		border: 1px solid #d4dceb;
		border-right: 0;
		background: white;
		min-height: 0;
	}

	.preview-frame :global(.shell) {
		min-height: 100%;
	}

	button {
		font: inherit;
		border: 0;
		border-radius: 999px;
		padding: 0.58rem 1rem;
		line-height: 1.1;
		cursor: pointer;
	}

	button.primary {
		background: #1f3046;
		color: white;
	}

	button.ghost {
		background: white;
		color: #1f3046;
		border: 1px solid #cfd8e7;
	}

	.publish-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.publish-button img {
		width: 0.95rem;
		height: 0.95rem;
		display: block;
	}
</style>
