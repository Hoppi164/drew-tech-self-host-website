<script lang="ts">
	type Props = {
		label?: string;
		ariaLabel?: string;
		onclick?: ((event: MouseEvent) => void) | undefined;
		disabled?: boolean;
		className?: string;
		type?: 'button' | 'submit' | 'reset';
	};

	let {
		label = 'New',
		ariaLabel,
		onclick,
		disabled = false,
		className = '',
		type = 'button'
	}: Props = $props();
</script>

<button
	aria-label={ariaLabel}
	class={`admin-new-button ${className}`.trim()}
	{disabled}
	{onclick}
	{type}
>
	<span>{label}</span>
	<span aria-hidden="true">+</span>
</button>

<style>
	.admin-new-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		padding: 0.34rem 0.56rem;
		font: inherit;
		font-size: 0.8rem;
		line-height: 1;
		color: #1f3046;
		background: white;
		border: 1px solid #cfd8e7;
		border-radius: 999px;
		cursor: pointer;
	}

	.admin-new-button span:first-child {
		font-size: 0.84rem;
		font-weight: 600;
		line-height: 1;
	}
</style>
