<script lang="ts">
	import clsx from 'clsx';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'critical' | 'dark';
	type Size = 'sm' | 'md' | 'lg' | 'icon';

	interface Props extends HTMLButtonAttributes {
		variant?: Variant;
		size?: Size;
		fullWidth?: boolean;
		children?: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		fullWidth = false,
		class: className = '',
		children,
		type = 'button',
		...rest
	}: Props = $props();

	const base =
		'inline-flex select-none items-center justify-center gap-2 rounded-[28px] font-medium leading-none transition-[transform,background-color,color,opacity,filter] duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-40';

	const variants: Record<Variant, string> = {
		primary: 'bg-lime text-on-lime hover:brightness-95',
		secondary: 'bg-surface text-ink hover:bg-line/60',
		outline: 'border border-line bg-transparent text-ink hover:bg-surface',
		ghost: 'bg-transparent text-ink hover:bg-surface',
		danger: 'bg-transparent text-critical hover:bg-critical/10',
		critical: 'bg-critical text-canvas hover:opacity-90',
		dark: 'bg-charcoal text-cream hover:opacity-90'
	};

	const sizes: Record<Size, string> = {
		sm: 'min-h-11 px-3 text-[13px]',
		md: 'min-h-11 px-5 text-sm',
		lg: 'min-h-12 px-6 text-base',
		icon: 'h-11 w-11 shrink-0 p-0'
	};
</script>

<button
	{...rest}
	{type}
	class={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
>
	{@render children?.()}
</button>
