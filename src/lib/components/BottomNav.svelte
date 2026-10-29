<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Backpack, CalendarDays, Wallet } from '@lucide/svelte';
	import clsx from 'clsx';

	const tabs = [
		{ href: '/trip/itinerary', label: 'Rencana', icon: CalendarDays },
		{ href: '/trip/preps', label: 'Bawaan', icon: Backpack },
		{ href: '/trip/budget', label: 'Budget', icon: Wallet }
	] as const;

	const path = $derived(page.url.pathname);

	function isActive(href: string): boolean {
		return path === href || path.startsWith(`${href}/`);
	}
</script>

<nav
	class="shrink-0 border-t border-line bg-canvas/95 px-3 pt-2 backdrop-blur"
	style:padding-bottom="calc(0.5rem + env(safe-area-inset-bottom))"
	aria-label="Bagian trip"
>
	<div class="grid grid-cols-3 gap-1">
		{#each tabs as tab (tab.href)}
			{@const Icon = tab.icon}
			{@const active = isActive(tab.href)}
			<a
				href={resolve(tab.href)}
				aria-current={active ? 'page' : undefined}
				class={clsx(
					'flex min-h-12 flex-col items-center justify-center gap-1 rounded-full px-2 py-2 text-[11px] font-medium transition focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none',
					active ? 'bg-lime text-on-lime' : 'text-muted hover:bg-surface hover:text-ink'
				)}
			>
				<Icon size={20} strokeWidth={active ? 2 : 1.75} />
				<span>{tab.label}</span>
			</a>
		{/each}
	</div>
</nav>
