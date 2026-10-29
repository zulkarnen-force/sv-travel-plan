<script lang="ts">
	import clsx from 'clsx';
	import Drawer from './Drawer.svelte';
	import type { ActionItem } from './action-sheet';

	interface Props {
		open?: boolean;
		title: string;
		description?: string;
		items: ActionItem[];
		onclose?: () => void;
	}

	let { open = $bindable(false), title, description = '', items, onclose }: Props = $props();

	function choose(item: ActionItem) {
		open = false;
		onclose?.();
		setTimeout(() => item.onselect(), 260);
	}
</script>

<Drawer bind:open {title} {description} {onclose}>
	<div class="-mx-1 divide-y divide-line">
		{#each items as item (item.label)}
			{@const Icon = item.icon}
			<button
				type="button"
				class={clsx(
					'flex min-h-14 w-full items-center gap-3 px-1 py-3 text-left transition focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none',
					item.danger ? 'text-critical' : 'text-ink'
				)}
				onclick={() => choose(item)}
			>
				{#if Icon}
					<span
						class={clsx(
							'grid h-9 w-9 shrink-0 place-items-center rounded-full',
							item.danger ? 'bg-critical/10' : 'bg-surface'
						)}
					>
						<Icon size={18} strokeWidth={1.75} />
					</span>
				{/if}
				<span class="min-w-0 flex-1">
					<span class="block text-[15px] leading-tight font-medium">{item.label}</span>
					{#if item.description}
						<span class="mt-0.5 block text-xs leading-snug text-muted">{item.description}</span>
					{/if}
				</span>
			</button>
		{/each}
	</div>
</Drawer>
