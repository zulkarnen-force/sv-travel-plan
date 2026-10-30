<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { app } from '#lib/state.svelte';
	import BottomNav from '#lib/components/BottomNav.svelte';
	import StorageNotice from '#lib/components/StorageNotice.svelte';
	import TopBar from '#lib/components/TopBar.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	const trip = $derived(app.trip);

	$effect(() => {
		if (app.ready && !app.trip) {
			goto(resolve('/'), { replace: true });
		}
	});
</script>

{#if trip}
	<div class="mx-auto flex h-dvh w-full max-w-[480px] flex-col border-x border-line bg-canvas">
		<TopBar {trip} />
		<StorageNotice />
		<main class="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
			{@render children()}
		</main>
		<BottomNav />
	</div>
{:else}
	<div class="grid min-h-dvh place-items-center bg-canvas">
		<p class="text-sm text-muted">Bentar ya, trip kamu lagi dimuat…</p>
	</div>
{/if}
