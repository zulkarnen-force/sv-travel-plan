<script lang="ts">
	import clsx from 'clsx';
	import type { Snippet } from 'svelte';

	interface Props {
		for?: string;
		class?: string;
		children: Snippet;
	}

	let { for: htmlFor, class: className = '', children }: Props = $props();
</script>

<label
	for={htmlFor}
	class={clsx('block text-[11px] font-medium tracking-[0.1em] text-muted uppercase', className)}
>
	{@render children()}
</label>
