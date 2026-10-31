<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		AlertTriangle,
		ArrowRight,
		Backpack,
		CalendarDays,
		CalendarPlus,
		Check,
		CircleDollarSign,
		Sparkles,
		Wallet
	} from '@lucide/svelte';
	import clsx from 'clsx';
	import type { Component } from 'svelte';
	import { app } from '#lib/state.svelte';
	import type { Tone } from '#lib/types';
	import {
		budgetStatus,
		categoryTotals,
		insightToneClass,
		plannedTotal,
		type RingTone
	} from '#lib/utils/budget';
	import { daysBetween, todayISO } from '#lib/utils/date';
	import { formatMoney, formatPercent } from '#lib/utils/format';
	import BudgetBar from '#lib/components/BudgetBar.svelte';
	import ProgressRing from '#lib/components/ProgressRing.svelte';
	import Card from '#lib/components/ui/Card.svelte';

	interface HomeAction {
		id: string;
		title: string;
		detail: string;
		cta: string;
		icon: Component;
		run: () => void;
		tone?: 'default' | 'critical';
	}

	const trip = $derived(app.trip);
	const currency = $derived(trip?.currency ?? 'IDR');
	const days = $derived(trip ? daysBetween(trip.startDate, trip.endDate) : 0);
	const today = $derived(todayISO());

	const dayLists = $derived(Array.from({ length: days }, (_, index) => app.entriesForDay(index)));
	const totalEntries = $derived(app.entries.length);
	const plannedDays = $derived(dayLists.filter((list) => list.length > 0).length);
	const emptyDays = $derived(days - plannedDays);
	const firstEmptyDay = $derived(dayLists.findIndex((list) => list.length === 0));
	const maxEntries = $derived(Math.max(1, ...dayLists.map((list) => list.length)));
	const unscheduled = $derived(app.unscheduledEntries());

	const packed = $derived(app.items.filter((item) => item.packed).length);
	const totalItems = $derived(app.items.length);
	const unpacked = $derived(totalItems - packed);

	const categories = $derived(
		app.categories
			.slice()
			.sort((a, b) => a.order - b.order)
			.map((category) => {
				const items = app.itemsForCategory(category.id);
				return {
					...category,
					packed: items.filter((item) => item.packed).length,
					total: items.length
				};
			})
			.filter((category) => category.total > 0)
	);

	const expenses = $derived(app.expenses);
	const planned = $derived(plannedTotal(expenses));
	const budget = $derived(trip?.budgetTotal ?? null);
	const hasBudget = $derived(budget !== null && budget > 0);
	const remaining = $derived(budget !== null ? budget - planned : 0);
	const missing = $derived(expenses.filter((expense) => expense.unitPrice === null).length);
	const totals = $derived(categoryTotals(expenses));
	const topCategories = $derived(
		totals
			.slice()
			.sort((a, b) => b.value - a.value)
			.slice(0, 3)
	);
	const categorySummary = $derived(
		topCategories.length
			? topCategories.map((slice) => `${slice.label} ${formatPercent(slice.share)}`).join(', ')
			: 'Belum ada pembagian'
	);

	const phase = $derived.by(() => {
		if (!trip) return { value: '', label: '' };
		if (today < trip.startDate) {
			const away = daysBetween(today, trip.startDate) - 1;
			return away === 0
				? { value: 'Hari ini', label: 'Trip mulai hari ini' }
				: { value: `H-${away}`, label: `${away} hari lagi` };
		}
		if (today > trip.endDate) {
			return { value: 'Selesai', label: 'Trip udah lewat' };
		}
		return { value: `Hari ${daysBetween(trip.startDate, today)}`, label: `dari ${days} hari` };
	});

	function progressTone(done: number, total: number): RingTone {
		if (total <= 0 || done <= 0) return 'neutral';
		if (done >= total) return 'success';
		return 'primary';
	}

	const budgetRing = $derived.by(() => {
		if (!hasBudget) {
			return {
				packed: 0,
				total: 0,
				value: '—',
				tone: 'neutral' as RingTone,
				description: 'Budget belum diatur'
			};
		}

		const limit = budget ?? 0;
		const ratio = planned / limit;
		const status = budgetStatus(planned, limit);
		const tone: RingTone =
			status === 'critical' ? 'critical' : status === 'warning' ? 'warning' : 'primary';

		return {
			packed: Math.min(planned, limit),
			total: limit,
			value: formatPercent(ratio),
			tone,
			description: `Budget, ${formatPercent(ratio)} terpakai, ${formatMoney(
				planned,
				currency
			)} dari ${formatMoney(limit, currency)}`
		};
	});

	const itineraryInsight = $derived.by(() => {
		if (totalEntries === 0) return 'Belum ada kegiatan. Mulai dari satu rencana di Hari 1.';
		if (unscheduled.length > 0) return `${unscheduled.length} kegiatan belum dapet hari.`;
		if (emptyDays > 0) {
			return `${plannedDays} dari ${days} hari udah ada rencana. Hari ${
				firstEmptyDay + 1
			} masih kosong.`;
		}
		return `Semua ${days} hari udah ada rencana.`;
	});

	const packingInsight = $derived.by(() => {
		if (totalItems === 0) return 'Belum ada item bawaan.';
		if (unpacked === 0) return 'Semua item udah dibawa.';
		const lagging = categories.slice().sort((a, b) => b.total - b.packed - (a.total - a.packed))[0];
		return lagging
			? `${unpacked} item lagi. Paling banyak di ${lagging.name}.`
			: `${unpacked} item lagi.`;
	});

	const budgetInsight = $derived.by(() => {
		if (!hasBudget) {
			return {
				text: 'Belum ada patokan. Isi total budget biar sisa uangnya kelihatan.',
				tone: 'neutral' as Tone
			};
		}
		if (planned > (budget ?? 0)) {
			return {
				text: `Kelebihan ${formatMoney(planned - (budget ?? 0), currency)} dari budget.`,
				tone: 'critical' as Tone
			};
		}
		if (missing > 0) {
			return {
				text: `${missing} item belum dibudget.`,
				tone: 'warning' as Tone
			};
		}
		if (planned === 0) {
			return { text: 'Belum ada pengeluaran.', tone: 'neutral' as Tone };
		}
		return {
			text: `Masih ada ${formatMoney((budget ?? 0) - planned, currency)} buat biaya ekstra.`,
			tone: 'success' as Tone
		};
	});

	const actions = $derived.by(() => {
		if (!trip) return [];
		const list: HomeAction[] = [];

		if (!hasBudget) {
			list.push({
				id: 'budget',
				title: 'Budget belum diatur',
				detail: 'Isi totalnya biar sisa uangnya kelihatan.',
				cta: 'Atur',
				icon: Wallet,
				run: () => {
					app.requestBudgetEdit();
					goto(resolve('/trip/budget'));
				}
			});
		}

		if (totalEntries === 0) {
			list.push({
				id: 'itinerary',
				title: 'Rencana masih kosong',
				detail: 'Mulai dari satu kegiatan di Hari 1.',
				cta: 'Isi',
				icon: CalendarPlus,
				run: () => {
					app.setActiveDay(0);
					app.requestItineraryAdd();
					goto(resolve('/trip/itinerary'));
				}
			});
		} else if (firstEmptyDay >= 0) {
			list.push({
				id: 'empty-day',
				title: `Hari ${firstEmptyDay + 1} belum ada rencana`,
				detail: `${emptyDays} hari masih kosong.`,
				cta: 'Isi',
				icon: CalendarDays,
				run: () => {
					app.setActiveDay(firstEmptyDay);
					app.requestItineraryAdd();
					goto(resolve('/trip/itinerary'));
				}
			});
		}

		if (trip.pendingSuggestionUpdate) {
			list.push({
				id: 'suggestions',
				title: 'Daftar bawaan perlu diperbarui',
				detail: 'Tanggal atau tujuan trip berubah.',
				cta: 'Perbarui',
				icon: Sparkles,
				run: () => goto(resolve('/trip/preps'))
			});
		}

		if (unscheduled.length > 0) {
			list.push({
				id: 'unscheduled',
				title: `${unscheduled.length} kegiatan belum terjadwal`,
				detail: 'Pindahin ke hari yang pas.',
				cta: 'Jadwalkan',
				icon: CalendarDays,
				run: () => goto(resolve('/trip/itinerary'))
			});
		}

		if (hasBudget && planned > (budget ?? 0)) {
			list.push({
				id: 'over',
				title: `Kelebihan ${formatMoney(planned - (budget ?? 0), currency)}`,
				detail: 'Rencana belanja di atas budget.',
				cta: 'Cek',
				icon: AlertTriangle,
				tone: 'critical',
				run: () => goto(resolve('/trip/budget'))
			});
		}

		if (missing > 0 && hasBudget) {
			list.push({
				id: 'missing',
				title: `${missing} biaya belum dibudget`,
				detail: 'Lengkapi biar totalnya akurat.',
				cta: 'Lengkapi',
				icon: CircleDollarSign,
				run: () => goto(resolve('/trip/budget'))
			});
		}

		if (totalItems === 0) {
			list.push({
				id: 'empty-packing',
				title: 'Daftar bawaan masih kosong',
				detail: 'Tambah item biar nggak ada yang ketinggalan.',
				cta: 'Tambah',
				icon: Backpack,
				run: () => goto(resolve('/trip/preps'))
			});
		} else if (unpacked > 0) {
			list.push({
				id: 'packing',
				title: `${unpacked} item belum dibawa`,
				detail: 'Centang yang udah masuk tas.',
				cta: 'Buka',
				icon: Backpack,
				run: () => goto(resolve('/trip/preps'))
			});
		}

		return list.slice(0, 3);
	});
</script>

{#if trip}
	<div class="space-y-5 px-4 pt-4 pb-8">
		<section class="rounded-[28px] bg-charcoal p-5 text-cream" aria-labelledby="status-heading">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h1
						id="status-heading"
						class="text-[10px] font-medium tracking-[0.1em] text-cream/60 uppercase"
					>
						Status trip
					</h1>
					<p
						class="mt-2 text-[52px] leading-[0.9] font-medium tracking-[-0.03em] text-cream tabular-nums"
					>
						{phase.value}
					</p>
					<p class="mt-2 text-sm text-cream/70">{phase.label}</p>
				</div>
				<span
					class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-cream/10 px-3 py-1.5 text-[11px] font-medium text-cream/80"
				>
					<CalendarDays size={13} strokeWidth={1.75} aria-hidden="true" />
					{days} hari
				</span>
			</div>

			<div class="mt-5 grid grid-cols-3 gap-2 border-t border-cream/15 pt-4">
				<div class="flex flex-col items-center gap-2">
					<ProgressRing
						packed={plannedDays}
						total={days}
						size={60}
						stroke={6}
						theme="dark"
						tone={progressTone(plannedDays, days)}
						label="Rencana"
						unit="hari udah ada rencana"
					/>
					<span class="text-[11px] text-cream/70" aria-hidden="true">Rencana</span>
				</div>
				<div class="flex flex-col items-center gap-2">
					<ProgressRing
						{packed}
						total={totalItems}
						size={60}
						stroke={6}
						theme="dark"
						tone={progressTone(packed, totalItems)}
						label="Bawaan"
						unit="item udah dibawa"
					/>
					<span class="text-[11px] text-cream/70" aria-hidden="true">Bawaan</span>
				</div>
				<div class="flex flex-col items-center gap-2">
					<ProgressRing
						packed={budgetRing.packed}
						total={budgetRing.total}
						size={60}
						stroke={6}
						theme="dark"
						tone={budgetRing.tone}
						value={budgetRing.value}
						description={budgetRing.description}
						label="Budget"
						showCheck={false}
					/>
					<span class="text-[11px] text-cream/70" aria-hidden="true">Budget</span>
				</div>
			</div>
		</section>

		{#if actions.length > 0}
			<section aria-labelledby="actions-heading">
				<div class="flex items-baseline justify-between gap-3 px-1">
					<h2 id="actions-heading" class="text-[20px] font-medium tracking-[-0.02em] text-ink">
						Perlu diurus
					</h2>
					<span class="text-xs text-muted">{actions.length} hal</span>
				</div>
				<div class="mt-2 space-y-2">
					{#each actions as action, index (action.id)}
						{@const Icon = action.icon}
						<button
							type="button"
							onclick={action.run}
							class="group flex min-h-14 w-full items-center gap-3 rounded-[28px] bg-surface p-4 text-left transition hover:bg-line/40 focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
						>
							<span
								class={clsx(
									'grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card',
									action.tone === 'critical' ? 'text-critical' : 'text-ink'
								)}
								aria-hidden="true"
							>
								<Icon size={18} strokeWidth={1.75} />
							</span>
							<span class="min-w-0 flex-1">
								<span class="block text-sm font-medium text-ink">{action.title}</span>
								<span class="mt-0.5 block text-xs leading-relaxed text-muted">
									{action.detail}
								</span>
							</span>
							{#if index === 0}
								<span
									class="inline-flex shrink-0 items-center gap-1 rounded-full bg-lime px-3 py-2 text-[11px] font-medium text-on-lime"
								>
									{action.cta}
									<ArrowRight size={12} strokeWidth={2} aria-hidden="true" />
								</span>
							{:else}
								<ArrowRight
									size={16}
									strokeWidth={1.75}
									class="shrink-0 text-muted transition group-hover:text-ink"
									aria-hidden="true"
								/>
							{/if}
						</button>
					{/each}
				</div>
			</section>
		{:else}
			<div class="flex items-center gap-3 rounded-[28px] bg-surface p-4">
				<span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime text-on-lime">
					<Check size={18} strokeWidth={2.2} aria-hidden="true" />
				</span>
				<p class="text-sm text-ink">
					{phase.value === 'Selesai'
						? 'Trip udah selesai. Datanya rapi.'
						: 'Nggak ada yang bolong. Tinggal jalan.'}
				</p>
			</div>
		{/if}

		<section aria-labelledby="plan-heading">
			<div class="flex items-baseline justify-between gap-3 px-1">
				<h2 id="plan-heading" class="text-[20px] font-medium tracking-[-0.02em] text-ink">
					Rencana
				</h2>
				<a
					href={resolve('/trip/itinerary')}
					aria-label="Buka rencana"
					class="inline-flex min-h-11 items-center gap-1 text-xs font-medium text-muted transition hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
				>
					Buka
					<ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
				</a>
			</div>

			<Card variant="surface" padding="lg" class="mt-2">
				<div
					class={clsx(
						'flex h-16 items-end justify-center border-b border-line/60',
						days > 21 ? 'gap-px' : 'gap-1'
					)}
					role="img"
					aria-label={`Rencana per hari, ${plannedDays} dari ${days} hari terisi`}
				>
					{#each dayLists as list, index (index)}
						<div
							class={clsx(
								'max-w-8 min-w-0 flex-1 rounded-full transition-[height] duration-300',
								list.length > 0 ? 'bg-lime' : 'bg-line/70'
							)}
							style:height={list.length > 0
								? `${Math.max(14, Math.round((list.length / maxEntries) * 100))}%`
								: '6px'}
							title={`Hari ${index + 1}: ${list.length} kegiatan`}
							aria-hidden="true"
						></div>
					{/each}
				</div>
				<div class="mt-2 flex items-center justify-between text-[10px] text-muted">
					<span>Hari 1</span>
					{#if days > 1}
						<span>Hari {days}</span>
					{/if}
				</div>
				<p class="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-muted">
					{itineraryInsight}
				</p>
			</Card>
		</section>

		<section aria-labelledby="pack-heading">
			<div class="flex items-baseline justify-between gap-3 px-1">
				<h2 id="pack-heading" class="text-[20px] font-medium tracking-[-0.02em] text-ink">
					Bawaan
				</h2>
				<a
					href={resolve('/trip/preps')}
					aria-label="Buka daftar bawaan"
					class="inline-flex min-h-11 items-center gap-1 text-xs font-medium text-muted transition hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
				>
					Buka
					<ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
				</a>
			</div>

			<Card variant="surface" padding="lg" class="mt-2">
				{#if categories.length > 0}
					<div class="-mx-1 no-scrollbar flex gap-3 overflow-x-auto px-1 pb-1">
						{#each categories as category (category.id)}
							<a
								href={resolve('/trip/preps/[category]', { category: category.id })}
								aria-label={`${category.name}, ${category.packed} dari ${category.total} item udah dibawa`}
								class="flex w-[72px] shrink-0 flex-col items-center gap-2 rounded-[18px] p-1 text-center transition hover:bg-card focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
							>
								<ProgressRing
									packed={category.packed}
									total={category.total}
									size={56}
									stroke={6}
									label={category.name}
									unit="item udah dibawa"
									tone={progressTone(category.packed, category.total)}
								/>
								<span class="line-clamp-2 text-[10px] leading-tight text-muted">
									{category.name}
								</span>
							</a>
						{/each}
					</div>
					<p class="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-muted">
						{packingInsight}
					</p>
				{:else}
					<p class="text-sm text-muted">Belum ada item bawaan.</p>
					<a
						href={resolve('/trip/preps')}
						class="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-ink underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
					>
						Tambah item
						<ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
					</a>
				{/if}
			</Card>
		</section>

		<section aria-labelledby="budget-heading">
			<div class="flex items-baseline justify-between gap-3 px-1">
				<h2 id="budget-heading" class="text-[20px] font-medium tracking-[-0.02em] text-ink">
					Budget
				</h2>
				<a
					href={resolve('/trip/budget')}
					aria-label={hasBudget ? 'Cek budget' : 'Atur budget'}
					onclick={() => {
						if (!hasBudget) app.requestBudgetEdit();
					}}
					class="inline-flex min-h-11 items-center gap-1 text-xs font-medium text-muted transition hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
				>
					{hasBudget ? 'Cek' : 'Atur'}
					<ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
				</a>
			</div>

			<Card variant="surface" padding="lg" class="mt-2">
				{#if hasBudget}
					<div class="flex items-start justify-between gap-3">
						<div>
							<p class="eyebrow">Rencana</p>
							<p
								class="mt-1 text-[22px] leading-none font-medium tracking-[-0.02em] text-ink tabular-nums"
							>
								{formatMoney(planned, currency)}
							</p>
						</div>
						<div class="text-right">
							<p class="eyebrow">{remaining < 0 ? 'Kelebihan' : 'Sisa'}</p>
							<p
								class={remaining < 0
									? 'mt-1 text-[22px] leading-none font-medium tracking-[-0.02em] text-critical tabular-nums'
									: 'mt-1 text-[22px] leading-none font-medium tracking-[-0.02em] text-ink tabular-nums'}
							>
								{formatMoney(Math.abs(remaining), currency)}
							</p>
						</div>
					</div>

					<div class="mt-4">
						<BudgetBar {planned} {budget} {currency} />
					</div>

					{#if totals.length > 0}
						<div class="mt-4 border-t border-line pt-3">
							<div
								class="flex h-2.5 overflow-hidden rounded-full bg-line/50"
								role="img"
								aria-label={`Pembagian rencana: ${categorySummary}`}
							>
								{#each totals as slice (slice.id)}
									<span
										class="h-full"
										style:width={`${slice.share * 100}%`}
										style:background={slice.color}
									></span>
								{/each}
							</div>
							<ul class="mt-2 flex flex-wrap gap-x-3 gap-y-1">
								{#each topCategories as slice (slice.id)}
									<li class="flex items-center gap-1.5 text-[11px] text-muted">
										<span
											class="h-2 w-2 shrink-0 rounded-full"
											style:background={slice.color}
											aria-hidden="true"
										></span>
										{slice.label}
										<span class="font-medium text-ink">{formatPercent(slice.share)}</span>
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					<p class={clsx('mt-3 text-xs leading-relaxed', insightToneClass(budgetInsight.tone))}>
						{budgetInsight.text}
					</p>
				{:else}
					<div class="flex items-start gap-3">
						<span
							class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card text-ink"
							aria-hidden="true"
						>
							<Wallet size={18} strokeWidth={1.75} />
						</span>
						<div class="min-w-0 flex-1">
							<p class="text-sm font-medium text-ink">Belum ada patokan</p>
							<p class="mt-1 text-xs leading-relaxed text-muted">
								Isi total budget biar tahu sisa uangnya.
								{#if planned > 0}
									Rencana belanja kamu sekarang {formatMoney(planned, currency)}.
								{/if}
							</p>
							<a
								href={resolve('/trip/budget')}
								onclick={() => app.requestBudgetEdit()}
								class="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-ink underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
							>
								Atur budget
								<ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
							</a>
						</div>
					</div>
				{/if}
			</Card>
		</section>
	</div>
{/if}
