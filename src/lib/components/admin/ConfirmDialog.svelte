<script lang="ts">
	type Props = {
		open?: boolean;
		title: string;
		description: string;
		confirmLabel?: string;
		cancelLabel?: string;
		tone?: 'default' | 'danger';
		onconfirm?: () => void;
		onclose?: () => void;
	};

	let {
		open = $bindable(false),
		title,
		description,
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		tone = 'default',
		onconfirm,
		onclose
	}: Props = $props();

	let dialog: HTMLDialogElement | undefined;

	$effect(() => {
		if (!dialog) return;

		if (open && !dialog.open) {
			dialog.showModal();
		}

		if (!open && dialog.open) {
			dialog.close('cancel');
		}
	});

	function handleClose() {
		const confirmed = dialog?.returnValue === 'confirm';
		open = false;
		if (confirmed) {
			onconfirm?.();
		}
		onclose?.();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === dialog) {
			dialog?.close('cancel');
		}
	}
</script>

<dialog bind:this={dialog} class="confirm-dialog" onclick={handleBackdropClick} onclose={handleClose}>
	<form class="dialog-card" method="dialog">
		<div class="dialog-copy">
			<h2>{title}</h2>
			<p>{description}</p>
		</div>
		<div class="dialog-actions">
			<button class="ghost" type="submit" value="cancel">{cancelLabel}</button>
			<button class:danger={tone === 'danger'} class="primary" type="submit" value="confirm">
				{confirmLabel}
			</button>
		</div>
	</form>
</dialog>

<style>
	.confirm-dialog {
		padding: 0;
		border: 0;
		background: transparent;
		max-width: min(92vw, 32rem);
		width: 100%;
	}

	.confirm-dialog::backdrop {
		background: rgba(15, 23, 35, 0.48);
		backdrop-filter: blur(3px);
	}

	.dialog-card {
		display: grid;
		gap: 1.25rem;
		margin: 0;
		padding: 1.4rem;
		border: 1px solid #d9deea;
		border-radius: 24px;
		background: #ffffff;
		box-shadow: 0 24px 70px rgba(22, 38, 59, 0.18);
	}

	.dialog-copy h2 {
		margin: 0 0 0.45rem;
		font-family: Georgia, serif;
		font-size: 1.3rem;
		color: #17212e;
	}

	.dialog-copy p {
		margin: 0;
		color: #536479;
		line-height: 1.6;
	}

	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.7rem;
	}

	button {
		font: inherit;
		border: 0;
		border-radius: 999px;
		padding: 0.75rem 1rem;
		cursor: pointer;
	}

	.primary {
		background: #1f3046;
		color: white;
	}

	.primary.danger {
		background: #8f1f2c;
	}

	.ghost {
		background: white;
		color: #1f3046;
		border: 1px solid #cfd8e7;
	}
</style>
