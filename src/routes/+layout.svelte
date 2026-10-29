<script lang="ts">
	import './layout.css';
	import ToastHost from '#lib/components/ui/ToastHost.svelte';
	import { app } from '#lib/state.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	function flushOnHide() {
		if (document.visibilityState === 'hidden') app.flush();
	}
</script>

<svelte:head>
	<title>Trip Pack — plan the trip, pack right</title>
	<link rel="icon" href="/icon.svg" type="image/svg+xml" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</svelte:head>

<svelte:window onbeforeunload={() => app.flush()} onvisibilitychange={flushOnHide} />

{@render children()}

<ToastHost />
