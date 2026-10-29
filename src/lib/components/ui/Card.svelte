<script lang="ts">
	import clsx from 'clsx';
	import type { Snippet } from 'svelte';

	type Variant = 'surface' | 'white' | 'dark' | 'lime' | 'outline';
	type Padding = 'none' | 'sm' | 'md' | 'lg';

	interface Props {
		variant?: Variant;
		padding?: Padding;
		class?: string;
		children: Snippet;
	}

	let { variant = 'surface', padding = 'md', class: className = '', children }: Props = $props();

	const variants: Record<Variant, string> = {
		surface: 'bg-surface text-ink',
		white: 'bg-card text-ink',
		dark: 'bg-charcoal text-cream',
		lime: 'bg-lime text-on-lime',
		outline: 'border border-line bg-transparent text-ink'
	};

	const paddings: Record<Padding, string> = {
		none: '',
		sm: 'p-4',
		md: 'p-5',
		lg: 'p-6'
	};
</script>

<div class={clsx('rounded-[28px]', variants[variant], paddings[padding], className)}>
	{@render children()}
</div>
