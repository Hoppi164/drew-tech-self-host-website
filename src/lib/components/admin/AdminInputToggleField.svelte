<script lang="ts">
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
		<label class="toggle" aria-label={toggleLabel}>
			<input
				checked={checked}
				onchange={(event) => onToggle((event.currentTarget as HTMLInputElement).checked)}
				type="checkbox"
			/>
			<span class="track">
				<span class="thumb"></span>
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
		gap: 0.85rem;
	}

	input {
		font: inherit;
	}

	.control-row > input {
		padding: 0.85rem 0.95rem;
		border-radius: 16px;
		border: 1px solid #cfd8e7;
		background: white;
		color: #1c2430;
	}

	.toggle {
		display: inline-flex;
		align-items: center;
		cursor: pointer;
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

	.track {
		position: relative;
		display: inline-flex;
		align-items: center;
		inline-size: 2.8rem;
		block-size: 1.65rem;
		padding: 0.16rem;
		border-radius: 999px;
		background: #d2dbe9;
		border: 1px solid #bcc8da;
		transition:
			background-color 180ms ease,
			border-color 180ms ease;
	}

	.thumb {
		inline-size: 1.1rem;
		block-size: 1.1rem;
		border-radius: 999px;
		background: white;
		box-shadow: 0 4px 10px rgba(35, 48, 66, 0.16);
		transition: transform 180ms ease;
	}

	.toggle input:checked + .track {
		background: #233042;
		border-color: #233042;
	}

	.toggle input:checked + .track .thumb {
		transform: translateX(1.08rem);
	}

	.toggle input:focus-visible + .track {
		outline: 2px solid #7aa2ff;
		outline-offset: 2px;
	}
</style>
