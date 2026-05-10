<script lang="ts">
	type Props = {
		summary?: string;
		open?: boolean;
		className?: string;
		onSummaryClick?: ((event: MouseEvent) => void) | undefined;
		summaryContent?: import('svelte').Snippet;
		actions?: import('svelte').Snippet;
		children: import('svelte').Snippet;
	};

	let {
		summary,
		open = false,
		className = '',
		onSummaryClick,
		summaryContent,
		actions,
		children
	}: Props = $props();

	let detailsElement = $state<HTMLDetailsElement | null>(null);

	$effect(() => {
		if (detailsElement) {
			detailsElement.open = open;
		}
	});

	function handleSummaryClick(event: MouseEvent) {
		if (!onSummaryClick) return;
		event.preventDefault();
		onSummaryClick(event);
	}
</script>

<div class={`accordion-shell ${className}`.trim()}>
	<details bind:this={detailsElement} class="accordion" {open}>
		<summary onclick={handleSummaryClick}>
			<span class="summary-copy">
				{#if summaryContent}
					{@render summaryContent()}
				{:else}
					{summary}
				{/if}
			</span>
			<span aria-hidden="true" class="icon">
				<span class="bar bar-static"></span>
				<span class="bar bar-rotating"></span>
			</span>
		</summary>
		<div class="content-wrap">
			<div class="content">
				{@render children()}
			</div>
		</div>
	</details>
	{#if actions}
		<div class="actions">
			{@render actions()}
		</div>
	{/if}
</div>

<style>
	.accordion-shell {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: start;
		gap: 0.75rem;
	}

	.accordion {
		border-top: 1px solid #d9deea;
		padding-top: 1rem;
		interpolate-size: allow-keywords;
		min-width: 0;
	}

	.accordion::details-content {
		display: block;
		overflow: hidden;
		block-size: 0;
		transition:
			block-size 260ms ease,
			content-visibility 260ms allow-discrete;
	}

	.accordion[open]::details-content {
		block-size: auto;
	}

	summary {
		list-style: none;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		cursor: pointer;
		font-weight: 700;
		color: #243244;
	}

	.summary-copy {
		min-width: 0;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	.icon {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.3rem;
		height: 1.3rem;
		border-radius: 999px;
		background: #eef2f8;
		color: #4b607c;
		font-size: 0.95rem;
		line-height: 1;
		transition: background-color 220ms ease;
	}

	.bar {
		position: absolute;
		width: 0.7rem;
		height: 0.12rem;
		border-radius: 999px;
		background: currentColor;
		transition:
			transform 220ms ease;
	}

	.bar-static {
		transform: rotate(0deg);
	}

	.accordion[open] .icon {
		background: #e8f0ff;
	}

	.bar-rotating {
		transform: rotate(-90deg);
		transform-origin: center;
	}

	.accordion[open] .bar-rotating {
		transform: rotate(0deg);
	}

	.content-wrap {
		overflow: hidden;
	}

	.actions {
		padding-top: 0.1rem;
	}

	.content {
		padding-top: 0;
		opacity: 0;
		transform: translateY(-6px);
		transition:
			opacity 180ms ease,
			transform 180ms ease,
			padding-top 180ms ease;
	}

	.accordion[open] .content {
		padding-top: 0.9rem;
		opacity: 1;
		transform: translateY(0);
	}
</style>
