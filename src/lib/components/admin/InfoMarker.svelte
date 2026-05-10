<script lang="ts">
	type Props = {
		label?: string;
		href?: string;
		hrefLabel?: string;
		children: import('svelte').Snippet;
	};

	let {
		label = 'More info',
		href,
		hrefLabel = 'Set up a GitHub PAT',
		children
	}: Props = $props();
</script>

<dfn
	class="info-marker"
>
	<button
		aria-label={label}
		class="trigger"
		title={label}
		type="button"
	>
		?
	</button>

	<span class="popover" role="note">
		<span class="popover-copy">
			{@render children()}
		</span>
		{#if href}
			<a href={href} rel="noreferrer" target="_blank">{hrefLabel}</a>
		{/if}
	</span>
</dfn>

<style>
	.info-marker {
		position: relative;
		display: inline-flex;
		font-style: normal;
	}

	.trigger {
		display: inline-grid;
		place-items: center;
		width: 1.2rem;
		height: 1.2rem;
		border: 1px solid #bfd0ee;
		border-radius: 999px;
		background: #f3f7ff;
		color: #365684;
		font-size: 0.76rem;
		font-weight: 700;
		line-height: 1;
		cursor: pointer;
		padding: 0;
	}

	.popover {
		position: absolute;
		top: calc(100% + 0.55rem);
		left: 50%;
		z-index: 30;
		width: min(280px, 70vw);
		padding: 0.85rem 0.9rem;
		border: 1px solid #d9deea;
		border-radius: 16px;
		background: white;
		box-shadow: 0 20px 45px rgba(22, 38, 59, 0.14);
		transform: translateX(-50%) translateY(-4px);
		opacity: 0;
		pointer-events: none;
		transition:
			opacity 160ms ease,
			transform 160ms ease;
	}

	.info-marker:focus-within .popover {
		opacity: 1;
		pointer-events: auto;
		transform: translateX(-50%) translateY(0);
	}

	.info-marker:hover .popover {
		opacity: 1;
		pointer-events: auto;
		transform: translateX(-50%) translateY(0);
	}

	.popover-copy {
		display: block;
		font-size: 0.85rem;
		line-height: 1.55;
		color: #425267;
	}

	a {
		display: inline-block;
		margin-top: 0.55rem;
		color: #1e4d8c;
		font-size: 0.84rem;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
