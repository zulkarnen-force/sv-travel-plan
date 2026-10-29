<script lang="ts">
	import clsx from 'clsx';
	import { PURPOSES } from '#lib/config';
	import type { PurposeId } from '#lib/types';

	interface Props {
		selected?: PurposeId;
	}

	let { selected = $bindable('general') }: Props = $props();
</script>

<div class="grid grid-cols-2 gap-2" role="group" aria-label="Tujuan trip">
	{#each PURPOSES as purpose (purpose.id)}
		<button
			type="button"
			class={clsx(
				'flex min-h-16 flex-col items-start justify-center rounded-[18px] px-3.5 py-2.5 text-left transition focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none',
				selected === purpose.id ? 'bg-lime text-on-lime' : 'bg-surface text-ink hover:bg-line/50'
			)}
			aria-pressed={selected === purpose.id}
			onclick={() => (selected = purpose.id)}
		>
			<span class="text-sm leading-tight font-medium">{purpose.label}</span>
			<span
				class={clsx(
					'mt-0.5 text-[11px] leading-snug',
					selected === purpose.id ? 'text-on-lime/70' : 'text-muted'
				)}>{purpose.hint}</span
			>
		</button>
	{/each}
</div>
