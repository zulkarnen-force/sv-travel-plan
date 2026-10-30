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
		/** Overrides the automatic tone, for rings that measure something other than packing. */
		tone?: RingTone;
		/** Dark rings sit on charcoal islands. */
		theme?: 'light' | 'dark';
		/** Replaces the packed/total text in the middle, for example "78%". */
		value?: string;
		/** Full screen-reader description. Falls back to packed/total wording. */
		description?: string;
		/** What the numbers count, used in the fallback description. */
		unit?: string;
		/** The check mark reads as "done", which is wrong for an over-budget ring. */
		showCheck?: boolean;
	}

	let {
		packed,
		total,
		size = 72,
		stroke = 8,
		label = 'Progres',
		tone: toneOverride,
		theme = 'light',
		value,
		description,
		unit = 'udah dibawa',
		showCheck = true
	}: Props = $props();

	const resolvedTone = $derived(toneOverride ?? ringTone(packed, total));
	const ratio = $derived(total > 0 ? Math.min(1, packed / total) : 0);
	const radius = $derived((size - stroke) / 2);
	const circumference = $derived(2 * Math.PI * radius);
	const dash = $derived(circumference * ratio);

	const palette = $derived<Record<RingTone, string>>({
		neutral: theme === 'dark' ? 'var(--smoke)' : 'var(--stone)',
		critical: theme === 'dark' ? '#ff9b7a' : 'var(--critical)',
		warning: theme === 'dark' ? '#f0b45e' : 'var(--warning)',
		primary: 'var(--lime)',
		success: theme === 'dark' ? '#a3d977' : 'var(--success)'
	});

	const color = $derived(palette[resolvedTone]);
	const complete = $derived(showCheck && total > 0 && packed >= total);
	const track = $derived(theme === 'dark' ? 'rgba(245, 245, 235, 0.16)' : 'var(--line)');
</script>

<div
	class="relative inline-grid shrink-0 place-items-center"
	style:width="{size}px"
	style:height="{size}px"
	role="img"
	aria-label={description ?? `${label}, ${packed} dari ${total} ${unit}`}
>
	<svg width={size} height={size} viewBox="0 0 {size} {size}" aria-hidden="true" class="-rotate-90">
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			style:stroke={track}
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
			stroke-linecap={ratio > 0 ? 'round' : 'butt'}
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
				'leading-none font-medium tabular-nums',
				theme === 'dark' ? 'text-cream' : 'text-ink',
				size >= 88 ? 'text-lg' : size >= 64 ? 'text-[13px]' : 'text-[11px]'
			)}
		>
			{value ?? `${packed}/${total}`}
		</span>
	</span>
</div>
