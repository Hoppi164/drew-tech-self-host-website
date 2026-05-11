<script lang="ts">
	import { Eye, EyeClosed } from '@lucide/svelte';

	type Props = {
		label: string;
		value: string;
		toggleLabel: string;
		checked: boolean;
		onInput: (value: string) => void;
		onToggle: (checked: boolean) => void;
	};

	let { label, value, toggleLabel, checked, onInput, onToggle }: Props = $props();
</script>

<div class="field">
	<span>{label}</span>
	<div class="control-row">
		<input
			aria-label={label}
			value={value}
			oninput={(event) => onInput((event.currentTarget as HTMLInputElement).value)}
		/>
		<label class="toggle" aria-label={toggleLabel} title={toggleLabel}>
			<input
				checked={checked}
				onchange={(event) => onToggle((event.currentTarget as HTMLInputElement).checked)}
				type="checkbox"
			/>
			<span class="icon-wrap" aria-hidden="true">
				{#if checked}
					<Eye size={18} strokeWidth={1.9} />
				{:else}
					<EyeClosed size={18} strokeWidth={1.9} />
				{/if}
			</span>
		</label>
	</div>
</div>

<style>
	.field {
		display: grid;
		gap: 0.35rem;
		margin-bottom: 0.9rem;
		font-weight: 600;
	}

	.control-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 0;
	}

	input {
		font: inherit;
	}

	.control-row > input {
		padding: 0.85rem 0.95rem;
		min-height: 3.05rem;
		border-radius: 16px 0 0 16px;
		border-right: 0;
		border: 1px solid #cfd8e7;
		background: white;
		color: #1c2430;
	}

	.toggle {
		display: inline-flex;
		align-items: center;
		cursor: pointer;
		color: #54657d;
	}

	.toggle input {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.icon-wrap {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		inline-size: 2.3rem;
		block-size: 3.05rem;
		border-radius: 0 16px 16px 0;
		background: #233042;
		border: 1px solid #bcc8da;
		border-left: 0;
		color: white;
		transition:
			background-color 180ms ease,
			border-color 180ms ease,
			color 180ms ease,
			transform 180ms ease;
	}

	.toggle:hover .icon-wrap {
		transform: translateY(-1px);
	}

	.toggle input:checked + .icon-wrap {
		background: #eef3f8;
		border-color: #bcc8da;
		color: #54657d;
	}

	.toggle input:focus-visible + .icon-wrap {
		outline: 2px solid #7aa2ff;
		outline-offset: 2px;
	}

	.control-row:focus-within > input,
	.control-row:focus-within .icon-wrap {
		border-color: #7aa2ff;
	}
</style>
