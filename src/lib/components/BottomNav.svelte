<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Backpack, CalendarDays, House, Wallet } from '@lucide/svelte';
	import clsx from 'clsx';
	import { untrack } from 'svelte';

	const tabs = [
		{ href: '/trip', label: 'Beranda', icon: House, exact: true },
		{ href: '/trip/itinerary', label: 'Rencana', icon: CalendarDays, exact: false },
		{ href: '/trip/preps', label: 'Bawaan', icon: Backpack, exact: false },
		{ href: '/trip/budget', label: 'Budget', icon: Wallet, exact: false }
	] as const;

	const path = $derived(page.url.pathname);

	function isActive(href: string, exact: boolean): boolean {
		return exact ? path === href : path === href || path.startsWith(`${href}/`);
	}

	const activeIndex = $derived(tabs.findIndex((tab) => isActive(tab.href, tab.exact)));
	// Keeps the pill on the first tab when no tab matches, before it fades out.
	const tabPosition = $derived(Math.max(activeIndex, 0));

	let animation: Animation | undefined;
	let previousIndex = untrack(() => tabPosition);

	// Slides the pill to the active tab, stretching like a drop of liquid on the way.
	function slideIndicator(el: Element) {
		const next = tabPosition;
		if (next === previousIndex) return;

		const from = previousIndex;
		previousIndex = next;

		const width = el.getBoundingClientRect().width;
		if (width === 0) return;

		// Continue from where a running animation currently is, so quick taps don't snap.
		const running = animation;
		let startX = from * width;
		if (running) {
			const matrix = new DOMMatrixReadOnly(getComputedStyle(el).transform);
			if (!Number.isNaN(matrix.m41)) startX = matrix.m41;
			running.cancel();
			animation = undefined;
		}

		const targetX = next * width;
		const distance = targetX - startX;

		// The inline style already moved the pill, so only animate when motion is welcome.
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const move = el.animate(
			[
				{ transform: `translate3d(${startX}px, 0, 0) scale(1, 1)` },
				{
					transform: `translate3d(${startX + distance * 0.65}px, 0, 0) scale(1.16, 0.9)`,
					offset: 0.45
				},
				{ transform: `translate3d(${targetX}px, 0, 0) scale(0.95, 1.04)`, offset: 0.82 },
				{ transform: `translate3d(${targetX}px, 0, 0) scale(1, 1)` }
			],
			{ duration: 820, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
		);
		animation = move;
		move.onfinish = () => {
			if (animation === move) animation = undefined;
		};
	}
</script>

<nav
	class="shrink-0 border-t border-line bg-canvas/95 px-3 pt-2 backdrop-blur"
	style:padding-bottom="calc(0.5rem + env(safe-area-inset-bottom))"
	aria-label="Bagian trip"
>
	<div class="relative grid grid-cols-4">
		<!-- The liquid pill lives behind the links and slides between them. -->
		<div
			{@attach slideIndicator}
			aria-hidden="true"
			class={clsx(
				'pointer-events-none absolute inset-y-0 left-0 w-1/4 p-0.5 transition-opacity duration-200',
				activeIndex === -1 && 'opacity-0'
			)}
			style:transform={`translateX(${tabPosition * 100}%)`}
		>
			<div class="h-full w-full rounded-full bg-lime"></div>
		</div>

		{#each tabs as tab (tab.href)}
			{@const Icon = tab.icon}
			{@const active = isActive(tab.href, tab.exact)}
			<a
				href={resolve(tab.href)}
				aria-current={active ? 'page' : undefined}
				class={clsx(
					'relative m-0.5 flex min-h-12 flex-col items-center justify-center gap-1 rounded-full px-2 py-2 text-[11px] font-medium transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none',
					active ? 'text-on-lime' : 'text-muted hover:bg-surface hover:text-ink'
				)}
			>
				<Icon size={20} strokeWidth={active ? 2 : 1.75} />
				<span>{tab.label}</span>
			</a>
		{/each}
	</div>
</nav>
