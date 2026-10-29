<script lang="ts">
	import clsx from 'clsx';
	import { budgetRatio, budgetStatus } from '#lib/utils/budget';
	import { formatMoney, formatPercent } from '#lib/utils/format';

	interface Props {
		planned: number;
		budget: number | null;
		currency: string;
	}

	let { planned, budget, currency }: Props = $props();

	const status = $derived(budgetStatus(planned, budget));
	const ratio = $derived(budgetRatio(planned, budget));

	const fill = $derived(
		status === 'critical'
			? 'bg-critical'
			: status === 'warning'
				? 'bg-warning'
				: status === 'none'
					? 'bg-stone'
					: 'bg-ink'
	);
</script>

<div>
	<div
		class="relative h-3 w-full overflow-hidden rounded-full bg-line/60"
		role="img"
		aria-label={budget === null
			? `${formatMoney(planned, currency)} direncanain, belum ada budget`
			: `${formatMoney(planned, currency)} direncanain dari budget ${formatMoney(budget, currency)}`}
	>
		<div
			class={clsx('h-full rounded-full transition-[width] duration-300', fill)}
			style:width="{Math.min(1, ratio) * 100}%"
		></div>
		{#if budget !== null && budget > 0}
			<span class="absolute inset-y-0 left-[80%] w-px bg-ink/70"></span>
		{/if}
	</div>
	<div class="mt-2 flex items-center justify-between gap-3 text-xs text-muted">
		<span>{formatMoney(planned, currency)} direncanain</span>
		{#if budget !== null && budget > 0}
			<span>{formatPercent(ratio)} dari {formatMoney(budget, currency)}</span>
		{:else}
			<span>Belum ada budget</span>
		{/if}
	</div>
</div>
