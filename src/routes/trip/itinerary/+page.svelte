<script lang="ts">
	import { tick } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { fly } from 'svelte/transition';
	import {
		CalendarDays,
		ChevronRight,
		Copy,
		MapPin,
		MoreVertical,
		Pencil,
		Trash2
	} from '@lucide/svelte';
	import { app } from '#lib/state.svelte';
	import type { EntryInput } from '#lib/state.svelte';
	import { toast } from '#lib/toast.svelte';
	import type { ItineraryEntry } from '#lib/types';
	import { formatDayChip, formatDayHeading, tripDayDates } from '#lib/utils/date';
	import ActionSheet from '#lib/components/ui/ActionSheet.svelte';
	import type { ActionItem } from '#lib/components/ui/action-sheet';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import Drawer from '#lib/components/ui/Drawer.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import ItineraryEntryDrawer from '#lib/components/ItineraryEntryDrawer.svelte';
	import { ENTRY_ICONS } from '#lib/components/entry-icons';

	const trip = $derived(app.trip);
	const dates = $derived(trip ? tripDayDates(trip.startDate, trip.endDate) : []);
	const activeDay = $derived(
		trip ? Math.min(Math.max(0, trip.activeDay), Math.max(0, dates.length - 1)) : 0
	);
	const dayDate = $derived(dates[activeDay] ?? '');
	const entries = $derived(app.entriesForDay(activeDay));
	const totalEntries = $derived(app.entries.length);
	const tripEmpty = $derived(totalEntries === 0);
	const hasTimed = $derived(entries.some((entry) => entry.time));
	const unscheduled = $derived(app.unscheduledEntries());
	const allDaysPlanned = $derived(
		dates.length > 0 && dates.every((_, index) => app.entriesForDay(index).length > 0)
	);
	const firstEmptyDay = $derived(
		dates.findIndex((_, index) => app.entriesForDay(index).length === 0)
	);
	const showHint = $derived(
		Boolean(trip && !trip.swipeHintSeen && dates.length > 1 && totalEntries > 0)
	);

	let addOpen = $state(false);
	let editOpen = $state(false);
	let actionsOpen = $state(false);
	let moveOpen = $state(false);
	let editingEntry = $state<ItineraryEntry | null>(null);
	let actionEntry = $state<ItineraryEntry | null>(null);
	let movingEntry = $state<ItineraryEntry | null>(null);
	let quickTitle = $state('');
	let quickTime = $state('');
	let highlightId = $state<string | null>(null);
	let showConfirmation = $state(false);
	let direction = $state(1);
	let strip: HTMLDivElement | undefined = $state();
	let highlightTimer: ReturnType<typeof setTimeout> | null = null;

	const previousLabel = $derived(activeDay > 0 ? `Hari ${activeDay}` : 'Hari 1');
	const nextLabel = $derived(
		activeDay < dates.length - 1
			? `Hari ${activeDay + 2} →`
			: allDaysPlanned
				? 'Semua hari udah terisi'
				: 'Balik ke hari kosong'
	);
	const nextDisabled = $derived(activeDay >= dates.length - 1 && allDaysPlanned);

	const actionItems: ActionItem[] = $derived(
		actionEntry
			? [
					{
						label: 'Ubah',
						description: 'Ubah detailnya',
						icon: Pencil,
						onselect: () => openEdit(actionEntry as ItineraryEntry)
					},
					{
						label: 'Duplikat',
						description: 'Tambah salinan di hari ini',
						icon: Copy,
						onselect: () => duplicateEntry(actionEntry as ItineraryEntry)
					},
					{
						label: 'Pindah ke hari lain',
						description: 'Termasuk ke daftar Belum terjadwal',
						icon: CalendarDays,
						onselect: () => startMove(actionEntry as ItineraryEntry)
					},
					{
						label: 'Hapus',
						description: 'Hapus kegiatan ini',
						icon: Trash2,
						danger: true,
						onselect: () => deleteEntry(actionEntry as ItineraryEntry)
					}
				]
			: []
	);

	$effect(() => {
		const index = activeDay;
		if (!strip) return;
		const chip = strip.querySelector<HTMLElement>(`[data-day="${index}"]`);
		chip?.scrollIntoView({
			behavior: prefersReducedMotion.current ? 'auto' : 'smooth',
			inline: 'center',
			block: 'nearest'
		});
	});

	$effect(() => {
		return () => {
			if (highlightTimer) clearTimeout(highlightTimer);
		};
	});

	function changeDay(next: number) {
		if (!trip) return;
		const clamped = Math.min(Math.max(0, next), dates.length - 1);
		if (clamped === activeDay) return;
		direction = clamped > activeDay ? 1 : -1;
		app.setActiveDay(clamped);
		app.markSwipeHintSeen();
		showConfirmation = false;
	}

	function onNext() {
		if (activeDay < dates.length - 1) {
			changeDay(activeDay + 1);
		} else if (!allDaysPlanned && firstEmptyDay >= 0) {
			changeDay(firstEmptyDay);
		}
	}

	function highlight(id: string) {
		highlightId = id;
		if (highlightTimer) clearTimeout(highlightTimer);
		highlightTimer = setTimeout(() => {
			highlightId = null;
		}, 1800);
	}

	function openAdd() {
		editingEntry = null;
		addOpen = true;
	}

	function openEdit(entry: ItineraryEntry) {
		editingEntry = entry;
		editOpen = true;
	}

	function openActions(entry: ItineraryEntry) {
		actionEntry = entry;
		actionsOpen = true;
	}

	function startMove(entry: ItineraryEntry) {
		movingEntry = entry;
		moveOpen = true;
	}

	async function saveEntry(input: EntryInput) {
		let focusId: string | null = null;
		if (editingEntry) {
			focusId = editingEntry.id;
			app.updateEntry(focusId, input);
			highlight(focusId);
			toast.show('Kegiatan udah diupdate');
		} else {
			const entry = app.addEntry(input);
			if (entry) {
				focusId = entry.id;
				highlight(entry.id);
				if (app.entries.length === 1 && input.dayIndex === 0) showConfirmation = true;
			}
		}

		await tick();
		if (focusId) {
			// Let the drawer finish closing and restore focus before moving it to the entry.
			setTimeout(() => document.getElementById(`entry-${focusId}`)?.focus(), 60);
		}
		setTimeout(() => {
			editingEntry = null;
		}, 320);
	}

	function deleteEntry(entry: ItineraryEntry) {
		const removed = app.deleteEntry(entry.id);
		if (removed) {
			toast.show('Kegiatan dihapus', { label: 'Urungkan', run: () => app.restoreEntry(removed) });
		}
		if (editingEntry?.id === entry.id) {
			setTimeout(() => {
				editingEntry = null;
			}, 320);
		}
	}

	function duplicateEntry(entry: ItineraryEntry) {
		const copy = app.duplicateEntry(entry.id);
		if (copy) {
			highlight(copy.id);
			toast.show('Kegiatan diduplikat');
		}
	}

	function moveTo(dayIndex: number | null) {
		if (!movingEntry) return;
		const entry = movingEntry;
		app.moveEntry(entry.id, dayIndex);
		toast.show(
			dayIndex === null ? 'Dipindah ke Belum terjadwal' : `Dipindah ke Hari ${dayIndex + 1}`
		);
		moveOpen = false;
		setTimeout(() => {
			movingEntry = null;
		}, 320);
	}

	async function quickAdd(event: SubmitEvent) {
		event.preventDefault();
		const title = quickTitle.trim();
		if (!title || !trip) return;

		const entry = app.addEntry({
			dayIndex: activeDay,
			title,
			time: quickTime || null,
			place: '',
			notes: '',
			type: 'activity'
		});

		if (!entry) return;
		quickTitle = '';
		quickTime = '';
		highlight(entry.id);
		showConfirmation = true;
		await tick();
		document.getElementById(`entry-${entry.id}`)?.focus();
	}

	let touchStart: { x: number; y: number } | null = null;

	function onTouchStart(event: TouchEvent) {
		const target = event.target as HTMLElement | null;
		if (target?.closest('button, a, input, textarea, select')) {
			touchStart = null;
			return;
		}
		const touch = event.touches[0];
		if (!touch) return;
		touchStart = { x: touch.clientX, y: touch.clientY };
	}

	function onTouchEnd(event: TouchEvent) {
		if (!touchStart) return;
		const touch = event.changedTouches[0];
		if (!touch) {
			touchStart = null;
			return;
		}
		const dx = touch.clientX - touchStart.x;
		const dy = touch.clientY - touchStart.y;
		touchStart = null;

		if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
		changeDay(dx < 0 ? activeDay + 1 : activeDay - 1);
	}

	function onWindowKeydown(event: KeyboardEvent) {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		const target = event.target as HTMLElement | null;
		if (target?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]'))
			return;
		event.preventDefault();
		changeDay(event.key === 'ArrowRight' ? activeDay + 1 : activeDay - 1);
	}
</script>

<svelte:window onkeydown={onWindowKeydown} />

{#if trip}
	<div class="pb-6">
		<div class="sticky top-0 z-20 border-b border-line/70 bg-canvas/95 px-4 py-2.5 backdrop-blur">
			<div
				bind:this={strip}
				class="no-scrollbar flex gap-2 overflow-x-auto"
				role="tablist"
				aria-label="Hari trip"
			>
				{#each dates as date, index (date)}
					{@const count = app.entriesForDay(index).length}
					<button
						type="button"
						data-day={index}
						role="tab"
						aria-selected={index === activeDay}
						aria-controls="day-pane"
						class={index === activeDay
							? 'flex min-w-16 shrink-0 flex-col items-center rounded-[18px] bg-lime px-3 py-2 text-on-lime'
							: 'flex min-w-16 shrink-0 flex-col items-center rounded-[18px] bg-surface px-3 py-2 text-ink hover:bg-line/50'}
						onclick={() => changeDay(index)}
					>
						<span class="text-[11px] leading-tight font-medium">Hari {index + 1}</span>
						<span class="text-[10px] leading-tight opacity-70">{formatDayChip(date)}</span>
						<span
							class={count > 0
								? 'mt-1.5 h-1.5 w-1.5 rounded-full bg-ink'
								: 'mt-1.5 h-1.5 w-1.5 rounded-full border border-ink/40'}
							aria-hidden="true"
						></span>
					</button>
				{/each}
			</div>
		</div>

		{#if unscheduled.length > 0}
			<Card variant="surface" padding="sm" class="mx-4 mt-3">
				<div class="flex items-center justify-between gap-3">
					<div>
						<p class="eyebrow">Belum terjadwal</p>
						<p class="mt-1 text-xs leading-snug text-muted">
							{unscheduled.length} kegiatan nggak muat lagi di tanggal trip.
						</p>
					</div>
					<Badge variant="warning">{unscheduled.length}</Badge>
				</div>
				<ul class="mt-3 space-y-1">
					{#each unscheduled as entry (entry.id)}
						<li class="flex items-center gap-2 rounded-xl bg-card px-2 py-1.5">
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm text-ink">{entry.title}</p>
								<p class="text-[11px] text-muted">Tanpa hari</p>
							</div>
							<Button size="sm" variant="ghost" onclick={() => startMove(entry)}>Pindah</Button>
							<button
								type="button"
								class="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-critical focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
								aria-label={`Hapus ${entry.title}`}
								onclick={() => deleteEntry(entry)}
							>
								<Trash2 size={16} strokeWidth={1.75} />
							</button>
						</li>
					{/each}
				</ul>
			</Card>
		{/if}

		<div class="px-4">
			<div
				class="relative"
				role="region"
				aria-label="Hari rencana"
				ontouchstart={onTouchStart}
				ontouchend={onTouchEnd}
			>
				{#key activeDay}
					<div
						id="day-pane"
						role="tabpanel"
						aria-label={`Hari ${activeDay + 1} dari ${dates.length}`}
						class="pt-4"
						in:fly={{ x: prefersReducedMotion.current ? 0 : direction * 18, duration: 180 }}
					>
						<header class="flex items-start justify-between gap-3">
							<div class="min-w-0">
								<p class="eyebrow">Hari {activeDay + 1} dari {dates.length}</p>
								<h1 class="mt-1 text-[26px] leading-tight font-medium tracking-[-0.03em] text-ink">
									{formatDayHeading(dayDate)}
								</h1>
							</div>
							<Badge variant={entries.length > 0 ? 'surface' : 'outline'}>
								{entries.length}
								rencana
							</Badge>
						</header>

						<div class="mt-4">
							{#if tripEmpty && activeDay === 0}
								<Card variant="lime" padding="lg">
									<p class="text-[10px] font-medium tracking-[0.1em] text-on-lime/70 uppercase">
										Hari 1
									</p>
									<h2
										class="mt-1 text-[24px] leading-tight font-medium tracking-[-0.03em] text-on-lime"
									>
										Mau ngapain duluan?
									</h2>
									<p class="mt-1 text-sm leading-relaxed text-on-lime/70">
										Ngopi, kereta, atau langsung makan. Apa aja. Detailnya, nanti.
									</p>
									<form class="mt-4 space-y-2" onsubmit={quickAdd}>
										<Input
											bind:value={quickTitle}
											placeholder="Kunjungi candi"
											maxlength={120}
											autofocus
											aria-label="Judul kegiatan"
										/>
										<div class="flex gap-2">
											<Input
												type="time"
												bind:value={quickTime}
												aria-label="Jam kegiatan (opsional)"
												class="w-32"
											/>
											<Button
												type="submit"
												variant="dark"
												class="flex-1"
												disabled={!quickTitle.trim()}
											>
												Tambah kegiatan
											</Button>
										</div>
									</form>
									<button
										type="button"
										class="mt-2 min-h-11 text-sm text-on-lime underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-on-lime focus-visible:outline-none"
										onclick={openAdd}
									>
										Isi detail
									</button>
								</Card>
							{:else if entries.length === 0}
								<Card variant="surface" padding="lg" class="text-center">
									<p class="text-sm text-muted">Belum ada rencana buat Hari {activeDay + 1}.</p>
									<Button variant="outline" class="mt-3" onclick={openAdd}>Tambah kegiatan</Button>
								</Card>
							{:else}
								<div class="space-y-2">
									{#each entries as entry, index (entry.id)}
										{#if hasTimed && !entry.time && (index === 0 || entries[index - 1].time)}
											<p class="eyebrow pt-2 pb-0.5">Kapan aja</p>
										{/if}
										{@const Icon = ENTRY_ICONS[entry.type]}
										<article
											id={`entry-${entry.id}`}
											tabindex="-1"
											class={highlightId === entry.id
												? 'flex gap-3 rounded-[18px] bg-lime/25 p-3 ring-1 ring-lime'
												: 'flex gap-3 rounded-[18px] bg-surface p-3'}
										>
											<span
												class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card text-ink"
												aria-hidden="true"
											>
												<Icon size={17} strokeWidth={1.75} />
											</span>
											<div class="min-w-0 flex-1">
												<div class="flex items-start justify-between gap-2">
													<div class="min-w-0">
														<div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
															{#if entry.time}
																<span class="text-xs font-medium text-muted tabular-nums"
																	>{entry.time}</span
																>
															{/if}
															<h2 class="text-[15px] leading-snug font-medium text-ink">
																{entry.title}
															</h2>
														</div>
														{#if entry.place}
															<p class="mt-1 flex items-center gap-1 text-xs text-muted">
																<MapPin size={12} strokeWidth={1.75} />
																{entry.place}
															</p>
														{/if}
														{#if entry.notes}
															<p class="mt-1 text-xs leading-relaxed text-muted">{entry.notes}</p>
														{/if}
													</div>
													<button
														type="button"
														class="-mt-1 -mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted transition hover:bg-card hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
														aria-label={`Aksi untuk ${entry.title}`}
														aria-haspopup="dialog"
														onclick={() => openActions(entry)}
													>
														<MoreVertical size={18} strokeWidth={1.75} />
													</button>
												</div>
											</div>
										</article>
									{/each}
								</div>

								{#if showConfirmation && activeDay < dates.length - 1}
									<div
										class="mt-3 flex items-center justify-between gap-3 rounded-[18px] bg-lime px-4 py-2.5 text-on-lime"
									>
										<p class="text-xs leading-snug font-medium text-ink">
											Hari {activeDay + 1} udah dimulai. Tambah lagi, atau lanjut.
										</p>
										<button
											type="button"
											class="min-h-11 shrink-0 text-xs font-medium text-on-lime underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-on-lime focus-visible:outline-none"
											onclick={() => changeDay(activeDay + 1)}
										>
											Hari {activeDay + 2} →
										</button>
									</div>
								{/if}
							{/if}
						</div>
					</div>
				{/key}

				{#if showHint}
					<div
						class="pointer-events-none absolute inset-y-0 right-0 flex items-center"
						aria-hidden="true"
					>
						<span
							class="animate-pulse rounded-full bg-charcoal/90 px-2.5 py-1.5 text-[10px] font-medium tracking-[0.08em] text-cream uppercase"
						>
							Geser <ChevronRight size={11} class="inline" />
						</span>
					</div>
					<p class="sr-only">
						Geser ke kiri atau kanan buat ganti hari. Bisa juga pakai tombol hari.
					</p>
				{/if}
			</div>

			<div class="mt-6">
				<Button fullWidth size="lg" onclick={openAdd}>Tambah ke Hari {activeDay + 1}</Button>
				<div class="mt-2 grid grid-cols-2 gap-2">
					<Button
						variant="secondary"
						disabled={activeDay === 0}
						onclick={() => changeDay(activeDay - 1)}
					>
						← {previousLabel}
					</Button>
					<Button variant="secondary" disabled={nextDisabled} onclick={onNext}>{nextLabel}</Button>
				</div>
			</div>
		</div>
	</div>
{/if}

<ItineraryEntryDrawer bind:open={addOpen} entry={null} dayIndex={activeDay} onsave={saveEntry} />

<ItineraryEntryDrawer
	bind:open={editOpen}
	entry={editingEntry}
	dayIndex={activeDay}
	onsave={saveEntry}
	ondelete={deleteEntry}
/>

<ActionSheet bind:open={actionsOpen} title={actionEntry?.title ?? 'Kegiatan'} items={actionItems} />

<Drawer
	bind:open={moveOpen}
	title="Pindah ke hari lain"
	description="Pilih hari yang pas buat kegiatan ini."
>
	<div class="space-y-1">
		{#each dates as date, index (date)}
			{@const count = app.entriesForDay(index).length}
			<button
				type="button"
				class="flex min-h-14 w-full items-center justify-between gap-3 rounded-[18px] px-3 py-2 text-left text-ink transition hover:bg-surface focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none disabled:opacity-40"
				disabled={movingEntry?.dayIndex === index}
				onclick={() => moveTo(index)}
			>
				<span class="text-sm font-medium">Hari {index + 1} · {formatDayChip(date)}</span>
				<span class="text-xs text-muted">{count} rencana</span>
			</button>
		{/each}
		<button
			type="button"
			class="flex min-h-14 w-full items-center justify-between gap-3 rounded-[18px] px-3 py-2 text-left text-ink transition hover:bg-surface focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none disabled:opacity-40"
			disabled={movingEntry?.dayIndex === null}
			onclick={() => moveTo(null)}
		>
			<span class="text-sm font-medium">Belum terjadwal</span>
			<span class="text-xs text-muted">Daftar sementara</span>
		</button>
	</div>
</Drawer>
