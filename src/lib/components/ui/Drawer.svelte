<script lang="ts">
	import { X } from '@lucide/svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		title: string;
		description?: string;
		children?: Snippet;
		footer?: Snippet;
		onclose?: () => void;
	}

	let {
		open = $bindable(false),
		title,
		description = '',
		children,
		footer,
		onclose
	}: Props = $props();

	let panel: HTMLDivElement | undefined = $state();

	function close() {
		open = false;
		onclose?.();
	}

	function focusable(): HTMLElement[] {
		if (!panel) return [];
		return Array.from(
			panel.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
			)
		).filter((element) => element.offsetParent !== null);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!open) return;

		if (event.key === 'Escape') {
			event.stopPropagation();
			close();
			return;
		}

		if (event.key !== 'Tab') return;
		const elements = focusable();
		if (!elements.length) return;
		const first = elements[0];
		const last = elements[elements.length - 1];

		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}

	$effect(() => {
		if (!open) return;

		const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		const timer = setTimeout(() => {
			const target = panel?.querySelector<HTMLElement>(
				'[data-autofocus], input:not([type="hidden"]), textarea, select, button'
			);
			target?.focus();
		}, 70);

		return () => {
			clearTimeout(timer);
			document.body.style.overflow = originalOverflow;
			previous?.focus?.();
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="fixed inset-0 z-50 flex items-end justify-center">
		<button
			type="button"
			tabindex="-1"
			aria-hidden="true"
			class="absolute inset-0 cursor-default bg-charcoal/60 backdrop-blur-[2px]"
			onclick={close}
			transition:fade={{ duration: prefersReducedMotion.current ? 0 : 160 }}
		></button>

		<div
			bind:this={panel}
			role="dialog"
			aria-modal="true"
			aria-label={title}
			class="relative z-10 max-h-[92dvh] w-full max-w-[480px] overflow-y-auto overscroll-contain rounded-t-[28px] bg-canvas px-5 pt-3 shadow-none"
			style:padding-bottom="calc(1.25rem + env(safe-area-inset-bottom))"
			transition:fly={{
				y: prefersReducedMotion.current ? 0 : 56,
				duration: prefersReducedMotion.current ? 0 : 260,
				easing: cubicOut
			}}
		>
			<div class="mx-auto mb-4 h-1 w-10 rounded-full bg-line"></div>

			<div class="flex items-start gap-3">
				<div class="min-w-0 flex-1">
					<h2 class="text-[22px] leading-tight font-medium tracking-[-0.02em] text-ink">{title}</h2>
					{#if description}
						<p class="mt-1 text-sm leading-relaxed text-muted">{description}</p>
					{/if}
				</div>
				<button
					type="button"
					class="-mt-1 -mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
					aria-label="Tutup"
					onclick={close}
				>
					<X size={20} strokeWidth={1.75} />
				</button>
			</div>

			<div class="mt-4">{@render children?.()}</div>

			{#if footer}
				<div
					class="sticky bottom-0 -mx-5 mt-5 border-t border-line bg-canvas px-5 pt-3"
					style:padding-bottom="calc(0.25rem + env(safe-area-inset-bottom))"
				>
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}
