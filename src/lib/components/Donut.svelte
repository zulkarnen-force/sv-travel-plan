<script lang="ts">
	import clsx from 'clsx';
	import { formatMoney, formatPercent } from '#lib/utils/format';

	export interface Slice {
		id: string;
		label: string;
		value: number;
		share: number;
		color: string;
	}

	interface Props {
		slices: Slice[];
		total: number;
		currency: string;
		size?: number;
		selectedId?: string | null;
		onselect?: (id: string | null) => void;
	}

	let { slices, total, currency, size = 208, selectedId = null, onselect }: Props = $props();

	const segments = $derived.by(() => {
		let offset = 0;
		return slices.map((slice) => {
			const segment = { ...slice, offset, percent: slice.share * 100 };
			offset += slice.share * 100;
			return segment;
		});
	});

	function choose(id: string) {
		onselect?.(selectedId === id ? null : id);
	}
</script>

<div class="relative mx-auto" style:width="{size}px" style:height="{size}px">
	<svg
		viewBox="0 0 100 100"
		class="h-full w-full"
		role="group"
		aria-label="Planned spending by category"
	>
		<circle
			cx="50"
			cy="50"
			r="38"
			fill="none"
			style:stroke="var(--line)"
			stroke-width="14"
			opacity="0.5"
		/>
		{#each segments as segment (segment.id)}
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<circle
				cx="50"
				cy="50"
				r="38"
				fill="none"
				style:stroke={segment.color}
				stroke-width={selectedId === segment.id ? 17 : 14}
				pathLength="100"
				stroke-dasharray="{Math.max(0.5, segment.percent - 1)} {100 -
					Math.max(0.5, segment.percent - 1)}"
				stroke-dashoffset={-segment.offset}
				transform="rotate(-90 50 50)"
				opacity={selectedId && selectedId !== segment.id ? 0.35 : 1}
				class={clsx(
					'transition-[opacity,stroke-width] duration-200',
					onselect && 'cursor-pointer focus-visible:outline-none'
				)}
				role={onselect ? 'button' : undefined}
				tabindex={onselect ? 0 : undefined}
				aria-label={`${segment.label}, ${formatPercent(segment.share)}, ${formatMoney(
					segment.value,
					currency
				)}`}
				aria-pressed={onselect ? selectedId === segment.id : undefined}
				onclick={() => onselect && choose(segment.id)}
				onkeydown={(event) => {
					if (!onselect) return;
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault();
						choose(segment.id);
					}
				}}
			/>
		{/each}
	</svg>

	<div
		class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
	>
		<span class="text-[10px] font-medium tracking-[0.1em] text-muted uppercase">Planned</span>
		<span class="mt-1 text-[22px] leading-none font-medium tracking-[-0.02em] text-ink">
			{formatMoney(total, currency)}
		</span>
	</div>
</div>
