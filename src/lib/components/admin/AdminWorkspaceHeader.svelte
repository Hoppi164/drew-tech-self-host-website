<script lang="ts">
	type Props = {
		title: string;
		status: string;
		error: string;
		onOpenPreview: () => void;
		onPublish: () => void;
	};

	let { title, status, error, onOpenPreview, onPublish }: Props = $props();
</script>

<header class="workspace-head">
	<div>
		<p class="eyebrow">Editing</p>
		<h2>{title}</h2>
		{#if status}<p class="status-inline">{status}</p>{/if}
		{#if error}<p class="status-inline error">{error}</p>{/if}
	</div>
	<div class="workspace-actions">
		<button class="ghost" onclick={onOpenPreview} type="button">Open Full Preview</button>
		<button class="primary" onclick={onPublish} type="button">Publish to GitHub</button>
	</div>
</header>

<style>
	.workspace-head {
		display: flex;
		justify-content: space-between;
		align-items: start;
		gap: 1rem;
	}

	.workspace-head h2 {
		margin: 0;
		font-family: Georgia, serif;
	}

	.eyebrow,
	.status-inline {
		color: #617086;
	}

	.eyebrow {
		margin: 0 0 0.35rem;
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: #5d6f8a;
	}

	.workspace-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	button {
		font: inherit;
		border: 0;
		border-radius: 999px;
		padding: 0.85rem 1.15rem;
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

	.error {
		color: #9f2435;
	}
</style>
