<script lang="ts">
	import clsx from 'clsx';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		value?: string | number;
	}

	let { value = $bindable(''), class: className = '', type = 'text', ...rest }: Props = $props();
</script>

<input
	bind:value
	{type}
	{...rest}
	class={clsx(
		'h-12 w-full rounded-lg border border-line bg-card px-3.5 text-base text-ink transition outline-none placeholder:text-muted focus:border-ink focus:ring-2 focus:ring-lime/60 disabled:opacity-50 aria-[invalid=true]:border-critical',
		className
	)}
/>
