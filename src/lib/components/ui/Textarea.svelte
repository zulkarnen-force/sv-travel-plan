<script lang="ts">
	import clsx from 'clsx';
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends HTMLTextareaAttributes {
		value?: string;
	}

	let { value = $bindable(''), class: className = '', ...rest }: Props = $props();
</script>

<textarea
	bind:value
	{...rest}
	class={clsx(
		'min-h-24 w-full resize-none rounded-lg border border-line bg-card px-3.5 py-3 text-base text-ink transition outline-none placeholder:text-muted focus:border-ink focus:ring-2 focus:ring-lime/60',
		className
	)}></textarea>
