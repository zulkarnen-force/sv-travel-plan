<script lang="ts">
	import { AlertTriangle } from '@lucide/svelte';
	import { app } from '#lib/state.svelte';
</script>

{#if app.storageError}
	<div
		role="status"
		class="flex items-start gap-2 border-b border-warning/30 bg-warning/10 px-4 py-2.5 text-warning"
	>
		<AlertTriangle size={16} strokeWidth={1.75} class="mt-0.5 shrink-0" />
		<p class="text-xs leading-snug">{app.storageError}</p>
	</div>
{/if}
