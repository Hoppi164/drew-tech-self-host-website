<script lang="ts">
	type Props = {
		title: string;
		intro: string;
		email: string;
		phone: string;
		address: string;
		ctaLabel: string;
		ctaUrl: string;
	};

	let { title, intro, email, phone, address, ctaLabel, ctaUrl }: Props = $props();
</script>

<section class="panel">
	<h1>{title}</h1>
	<p>{intro}</p>
	<dl>
		<div>
			<dt>Email</dt>
			<dd><a href={`mailto:${email}`}>{email}</a></dd>
		</div>
		<div>
			<dt>Phone</dt>
			<dd><a href={`tel:${phone}`}>{phone}</a></dd>
		</div>
		<div>
			<dt>Address</dt>
			<dd>{address}</dd>
		</div>
	</dl>
	<a class="cta" href={ctaUrl}>{ctaLabel}</a>
</section>

<style>
	.panel {
		background: var(--site-surface);
		border: 1px solid var(--site-border);
		border-radius: var(--site-radius);
		padding: 2rem;
	}

	h1 {
		font-family: var(--site-heading-font);
		font-size: clamp(2.2rem, 5vw, 4rem);
		margin: 0 0 0.75rem;
	}

	p,
	dd {
		color: var(--site-muted);
		line-height: 1.7;
	}

	dl {
		display: grid;
		gap: 1rem;
		margin: 1.5rem 0;
	}

	dt {
		font-weight: 700;
		margin-bottom: 0.25rem;
	}

	dd {
		margin: 0;
	}

	dd a {
		color: inherit;
	}

	.cta {
		display: inline-flex;
		padding: 0.9rem 1.2rem;
		border-radius: 999px;
		background: var(--site-accent);
		color: white;
		text-decoration: none;
	}
</style>
