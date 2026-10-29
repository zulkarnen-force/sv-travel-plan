<script lang="ts">
	import clsx from 'clsx';
	import type { Snippet } from 'svelte';

	type Variant = 'lime' | 'surface' | 'outline' | 'dark' | 'warning' | 'critical' | 'success';

	interface Props {
		variant?: Variant;
		class?: string;
		children: Snippet;
	}

	let { variant = 'surface', class: className = '', children }: Props = $props();

	const variants: Record<Variant, string> = {
		lime: 'bg-lime text-on-lime',
		surface: 'bg-surface text-ink',
		outline: 'border border-line bg-transparent text-muted',
		dark: 'bg-charcoal text-cream',
		warning: 'bg-warning/15 text-warning',
		critical: 'bg-critical/10 text-critical',
		success: 'bg-success/15 text-success'
	};
</script>

<span
	class={clsx(
		'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-[0.08em] uppercase',
		variants[variant],
		className
	)}
>
	{@render children()}
</span>
