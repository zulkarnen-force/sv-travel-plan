<script lang="ts">
	import clsx from 'clsx';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import {
		buildMonthGrid,
		daysBetween,
		formatLongDate,
		isValidISO,
		monthLabel,
		parseDate,
		shiftMonth,
		todayISO
	} from '#lib/utils/date';

	interface Props {
		start?: string | null;
		end?: string | null;
	}

	let { start = $bindable(null), end = $bindable(null) }: Props = $props();

	const initial = parseDate(start && isValidISO(start) ? start : todayISO());
	let viewYear = $state(initial.getFullYear());
	let viewMonth = $state(initial.getMonth());
	let error = $state('');

	const today = todayISO();
	const cells = $derived(buildMonthGrid(viewYear, viewMonth));
	const weekdays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

	function move(delta: number) {
		const next = shiftMonth(viewYear, viewMonth, delta);
		viewYear = next.year;
		viewMonth = next.month;
		error = '';
	}

	function pick(iso: string) {
		error = '';

		if (!start || (start && end)) {
			start = iso;
			end = null;
			return;
		}

		if (iso < start) {
			error = 'Pilih tanggal yang sama atau setelah tanggal mulai.';
			return;
		}

		const length = daysBetween(start, iso);
		if (length > 60) {
			error = `Itu ${length} hari. Trip maksimal 60 hari.`;
			return;
		}

		end = iso;
	}

	function isSelected(iso: string) {
		return iso === start || iso === end;
	}

	function isInRange(iso: string) {
		return Boolean(start && end && iso > start && iso < end);
	}

	function isDisabled(iso: string) {
		return Boolean(start && !end && iso < start);
	}
</script>

<div role="group" aria-label="Tanggal trip" class="rounded-[28px] bg-surface p-4">
	<div class="flex items-center justify-between">
		<button
			type="button"
			class="grid h-11 w-11 place-items-center rounded-full text-ink transition hover:bg-card focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
			aria-label="Bulan sebelumnya"
			onclick={() => move(-1)}
		>
			<ChevronLeft size={20} strokeWidth={1.75} />
		</button>
		<p class="text-sm font-medium text-ink" aria-live="polite">{monthLabel(viewYear, viewMonth)}</p>
		<button
			type="button"
			class="grid h-11 w-11 place-items-center rounded-full text-ink transition hover:bg-card focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
			aria-label="Bulan berikutnya"
			onclick={() => move(1)}
		>
			<ChevronRight size={20} strokeWidth={1.75} />
		</button>
	</div>

	<div class="mt-2 grid grid-cols-7 gap-1" aria-hidden="true">
		{#each weekdays as weekday (weekday)}
			<span
				class="grid h-8 place-items-center text-[10px] font-medium tracking-[0.08em] text-muted uppercase"
			>
				{weekday}
			</span>
		{/each}
	</div>

	<div class="grid grid-cols-7 gap-1">
		{#each cells as cell (cell.iso)}
			<button
				type="button"
				class={clsx(
					'relative flex h-11 w-full items-center justify-center rounded-full text-sm tabular-nums transition focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none',
					!cell.inMonth && 'invisible',
					isSelected(cell.iso) && 'bg-lime font-medium text-on-lime',
					isInRange(cell.iso) && 'bg-lime/25 text-ink',
					!isSelected(cell.iso) && !isInRange(cell.iso) && 'text-ink hover:bg-card',
					cell.iso === today && !isSelected(cell.iso) && 'ring-1 ring-line ring-inset',
					isDisabled(cell.iso) && 'opacity-25'
				)}
				disabled={!cell.inMonth || isDisabled(cell.iso)}
				aria-pressed={isSelected(cell.iso)}
				aria-current={cell.iso === today ? 'date' : undefined}
				aria-label={`${formatLongDate(cell.iso)}${
					cell.iso === today ? ', hari ini' : ''
				}${isSelected(cell.iso) ? ', dipilih' : ''}`}
				onclick={() => pick(cell.iso)}
			>
				{cell.day}
			</button>
		{/each}
	</div>

	{#if error}
		<p class="mt-2 text-xs leading-snug text-critical" role="alert">{error}</p>
	{/if}
</div>
