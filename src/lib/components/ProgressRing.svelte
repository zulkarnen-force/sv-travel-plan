<script lang="ts">
	import clsx from 'clsx';
	import { Check } from '@lucide/svelte';
	import { ringTone, type RingTone } from '#lib/utils/budget';

	interface Props {
		packed: number;
		total: number;
		size?: number;
		stroke?: number;
		label?: string;
	}

	let { packed, total, size = 72, stroke = 8, label = 'Progress' }: Props = $props();

	const tone = $derived(ringTone(packed, total));
	const ratio = $derived(total > 0 ? Math.min(1, packed / total) : 0);
	const radius = $derived((size - stroke) / 2);
	const circumference = $derived(2 * Math.PI * radius);
	const dash = $derived(circumference * ratio);

	const colors: Record<RingTone, string> = {
		neutral: 'var(--stone)',
		critical: 'var(--critical)',
		warning: 'var(--warning)',
		primary: 'var(--lime)',
		success: 'var(--success)'
	};

	const color = $derived(colors[tone]);
	const complete = $derived(total > 0 && packed >= total);
</script>

<div
	class="relative inline-grid shrink-0 place-items-center"
	style:width="{size}px"
	style:height="{size}px"
	role="img"
	aria-label={`${label}, ${packed} of ${total} packed`}
>
	<svg width={size} height={size} viewBox="0 0 {size} {size}" aria-hidden="true" class="-rotate-90">
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			style:stroke="var(--line)"
			stroke-width={stroke}
			opacity="0.55"
		/>
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			style:stroke={color}
			stroke-width={stroke}
			stroke-linecap="round"
			stroke-dasharray="{dash} {circumference}"
			style:transition="stroke-dasharray 240ms ease, stroke 200ms ease"
		/>
	</svg>

	<span class="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
		{#if complete}
			<Check size={size >= 88 ? 18 : 13} strokeWidth={2.4} {color} />
		{/if}
		<span
			class={clsx(
				'leading-none font-medium text-ink tabular-nums',
				size >= 88 ? 'text-lg' : size >= 64 ? 'text-[13px]' : 'text-[11px]'
			)}
		>
			{packed}/{total}
		</span>
	</span>
</div>
