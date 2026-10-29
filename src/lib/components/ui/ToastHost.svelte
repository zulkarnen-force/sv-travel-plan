<script lang="ts">
	import { X } from '@lucide/svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { toast } from '#lib/toast.svelte';
</script>

<div
	class="pointer-events-none fixed left-1/2 z-[70] flex w-[calc(100vw-2rem)] max-w-[28rem] -translate-x-1/2 flex-col gap-2"
	style:bottom="calc(5.75rem + env(safe-area-inset-bottom))"
	aria-live="polite"
	aria-atomic="false"
>
	{#each toast.toasts as item (item.id)}
		<div
			role="status"
			class="pointer-events-auto flex items-center gap-2 rounded-2xl bg-charcoal px-4 py-2 text-cream"
			animate:flip={{ duration: prefersReducedMotion.current ? 0 : 180 }}
			transition:fly={{ y: prefersReducedMotion.current ? 0 : 16, duration: 200 }}
		>
			<p class="min-w-0 flex-1 py-1 text-sm leading-snug">{item.message}</p>
			{#if item.action}
				<button
					type="button"
					class="min-h-11 shrink-0 rounded-full px-3 text-sm font-medium text-lime transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-lime focus-visible:outline-none"
					onclick={() => toast.runAction(item.id)}
				>
					{item.action.label}
				</button>
			{/if}
			<button
				type="button"
				class="grid h-11 w-11 shrink-0 place-items-center rounded-full text-cream/70 transition hover:bg-white/10 hover:text-cream focus-visible:ring-2 focus-visible:ring-lime focus-visible:outline-none"
				aria-label="Tutup notifikasi"
				onclick={() => toast.dismiss(item.id)}
			>
				<X size={16} strokeWidth={1.75} />
			</button>
		</div>
	{/each}
</div>
