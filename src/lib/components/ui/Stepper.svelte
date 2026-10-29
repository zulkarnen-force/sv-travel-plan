<script lang="ts">
	import { Minus, Plus } from '@lucide/svelte';

	interface Props {
		value?: number;
		min?: number;
		max?: number;
		label?: string;
		onchange?: (value: number) => void;
	}

	let { value = $bindable(1), min = 1, max = 999, label = 'Quantity', onchange }: Props = $props();

	function set(next: number) {
		const clamped = Math.min(max, Math.max(min, Math.round(next)));
		if (clamped === value) return;
		value = clamped;
		onchange?.(clamped);
	}
</script>

<div
	class="inline-flex items-center rounded-full border border-line bg-card"
	role="group"
	aria-label={`${label} quantity`}
>
	<button
		type="button"
		class="grid h-11 w-11 place-items-center rounded-full text-ink transition hover:bg-surface focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none disabled:opacity-30"
		aria-label={`Decrease ${label.toLowerCase()}`}
		disabled={value <= min}
		onclick={() => set(value - 1)}
	>
		<Minus size={16} strokeWidth={2} />
	</button>
	<span class="min-w-7 text-center text-sm font-medium tabular-nums" aria-live="polite"
		>{value}</span
	>
	<button
		type="button"
		class="grid h-11 w-11 place-items-center rounded-full text-ink transition hover:bg-surface focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none disabled:opacity-30"
		aria-label={`Increase ${label.toLowerCase()}`}
		disabled={value >= max}
		onclick={() => set(value + 1)}
	>
		<Plus size={16} strokeWidth={2} />
	</button>
</div>
