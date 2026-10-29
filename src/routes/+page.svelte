<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ArrowLeft, Luggage } from '@lucide/svelte';
	import { buildSuggestions, purposeLabel } from '#lib/config';
	import { app } from '#lib/state.svelte';
	import type { PurposeId } from '#lib/types';
	import { daysBetween, formatLength, formatRange, isPast } from '#lib/utils/date';
	import PurposeChips from '#lib/components/PurposeChips.svelte';
	import RangeCalendar from '#lib/components/RangeCalendar.svelte';
	import StorageNotice from '#lib/components/StorageNotice.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import Label from '#lib/components/ui/Label.svelte';
	import Textarea from '#lib/components/ui/Textarea.svelte';

	const draft = app.draft;

	function startingStep(): number {
		if (!draft) return 1;
		if (!draft.name.trim() || draft.name.trim().length > 60) return 1;
		if (!draft.startDate || !draft.endDate) return 2;
		return Math.min(3, Math.max(1, draft.step));
	}

	let step = $state(startingStep());
	let name = $state(draft?.name ?? '');
	let startDate = $state<string | null>(draft?.startDate ?? null);
	let endDate = $state<string | null>(draft?.endDate ?? null);
	let purpose = $state<PurposeId>(draft?.purpose ?? 'general');
	let purposeNote = $state(draft?.purposeNote ?? '');

	const nameValid = $derived(name.trim().length >= 1 && name.trim().length <= 60);
	const days = $derived(startDate && endDate ? daysBetween(startDate, endDate) : 0);
	const datesValid = $derived(Boolean(startDate) && Boolean(endDate) && days >= 1 && days <= 60);
	const canContinue = $derived(step === 1 ? nameValid : step === 2 ? datesValid : true);
	const suggestionCount = $derived(days > 0 ? buildSuggestions(days, purpose).length : 0);

	const heading = $derived(
		step === 1 ? 'Namanya trip apa?' : step === 2 ? 'Kapan berangkatnya?' : 'Trip-nya buat apa?'
	);
	const subheading = $derived(
		step === 1
			? 'Satu tempat buat rencana, bawaan, dan budget kamu.'
			: step === 2
				? 'Ketuk tanggal mulai, lalu tanggal selesai. Trip sehari juga boleh.'
				: 'Ini ngaruh ke daftar baju. Semua masih bisa diedit.'
	);

	const examples = ['Bali sama temen', 'Kerja di Oslo', 'Naik gunung di Dolomites'];

	$effect(() => {
		if (app.trip) goto(resolve('/trip/itinerary'), { replace: true });
	});

	$effect(() => {
		if (app.trip) return;
		app.saveDraft({ step, name, startDate, endDate, purpose, purposeNote });
	});

	function next() {
		if (!canContinue) return;
		if (step < 3) {
			step += 1;
			return;
		}
		finish();
	}

	function back() {
		if (step > 1) step -= 1;
	}

	function finish() {
		if (!nameValid || !startDate || !endDate) return;
		app.createTrip({
			name: name.trim(),
			startDate,
			endDate,
			purpose,
			purposeNote: purposeNote.trim()
		});
		goto(resolve('/trip/itinerary'), { replace: true });
	}
</script>

{#if !app.trip}
	<div class="mx-auto flex h-dvh w-full max-w-[480px] flex-col border-x border-line bg-canvas">
		<div class="min-h-0 flex-1 overflow-y-auto">
			<header
				class="mx-3 rounded-[28px] bg-lime p-5 text-on-lime"
				style:margin-top="calc(0.75rem + env(safe-area-inset-top))"
			>
				<div class="flex items-center justify-between gap-3">
					<span class="inline-flex items-center gap-2 text-sm font-medium text-on-lime">
						<span class="grid h-8 w-8 place-items-center rounded-full bg-charcoal text-lime">
							<Luggage size={16} strokeWidth={2} />
						</span>
						Trip Pack
					</span>
					{#if step > 1}
						<button
							type="button"
							class="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-medium text-on-lime transition hover:bg-on-lime/10 focus-visible:ring-2 focus-visible:ring-on-lime focus-visible:outline-none"
							onclick={back}
						>
							<ArrowLeft size={16} strokeWidth={2} />
							Kembali
						</button>
					{/if}
				</div>

				<div class="mt-5 flex gap-1.5" aria-hidden="true">
					{#each [1, 2, 3] as segment (segment)}
						<span
							class="h-1.5 flex-1 rounded-full {segment <= step ? 'bg-on-lime' : 'bg-on-lime/20'}"
						></span>
					{/each}
				</div>
				<p class="sr-only">Langkah {step} dari 3</p>

				<p class="mt-5 text-[10px] font-medium tracking-[0.1em] text-on-lime/70 uppercase">
					Langkah {step} dari 3
				</p>
				<h1 class="mt-2 text-[34px] leading-[1.02] font-medium tracking-[-0.03em] text-on-lime">
					{heading}
				</h1>
				<p class="mt-2 max-w-[34ch] text-sm leading-relaxed text-on-lime/70">{subheading}</p>
			</header>

			<StorageNotice />

			<main class="px-4 pt-4 pb-8">
				{#if step === 1}
					<Card variant="white" padding="lg">
						<Label for="trip-name">Nama trip</Label>
						<Input
							id="trip-name"
							bind:value={name}
							maxlength={60}
							autocomplete="off"
							placeholder="Bali sama temen"
							autofocus
							class="mt-2"
							aria-describedby={name.length > 0 && !nameValid
								? 'name-help name-error'
								: 'name-help'}
							aria-invalid={name.length > 0 && !nameValid}
						/>
						<div id="name-help" class="mt-2 flex justify-between text-xs text-muted">
							<span>1–60 karakter</span>
							<span>{name.trim().length}/60</span>
						</div>
						{#if name.length > 0 && !nameValid}
							<p id="name-error" class="mt-1 text-xs text-critical">Isi 1 sampai 60 karakter ya.</p>
						{/if}

						<div class="mt-5 border-t border-line pt-4">
							<p class="eyebrow">Bingung? Cobain ini</p>
							<div class="mt-2 flex flex-wrap gap-2">
								{#each examples as example (example)}
									<button
										type="button"
										class="min-h-11 rounded-full border border-line px-3 text-xs text-ink transition hover:bg-surface focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
										onclick={() => (name = example)}
									>
										{example}
									</button>
								{/each}
							</div>
						</div>
					</Card>
				{:else if step === 2}
					<RangeCalendar bind:start={startDate} bind:end={endDate} />

					{#if startDate && endDate}
						<div
							class="mt-3 flex items-center justify-between gap-3 rounded-full bg-lime px-4 py-2.5 text-on-lime"
							role="status"
						>
							<span class="text-sm font-medium text-on-lime">{formatLength(days)}</span>
							<span class="text-xs text-on-lime/70">{formatRange(startDate, endDate)}</span>
						</div>
					{:else}
						<p class="mt-3 text-center text-xs text-muted">
							{startDate
								? 'Sekarang pilih tanggal selesai.'
								: 'Pilih tanggal mulai, terus tanggal selesai.'}
						</p>
					{/if}

					{#if startDate && isPast(startDate)}
						<p class="mt-3 px-1 text-xs leading-relaxed text-muted">
							Trip-nya udah mulai — nggak apa-apa. Kamu bisa catat sambil jalan.
						</p>
					{/if}
				{:else}
					<PurposeChips bind:selected={purpose} />

					<div class="mt-5">
						<Label for="purpose-note">Catatan (opsional)</Label>
						<Textarea
							id="purpose-note"
							bind:value={purposeNote}
							maxlength={240}
							placeholder="Ada hal yang ngaruh ke bawaan?"
							class="mt-2"
						/>
					</div>

					<Card variant="surface" class="mt-4">
						<p class="eyebrow">Daftar awal kamu</p>
						<p class="mt-2 text-sm leading-relaxed text-muted">
							Kami mulai dengan <span class="font-medium text-ink">{suggestionCount} item baju</span
							>
							buat trip {purposeLabel(purpose)} selama {formatLength(days)}. Bisa ditambah, diedit,
							atau dicentang nanti.
						</p>
					</Card>
				{/if}
			</main>
		</div>

		<div
			class="shrink-0 border-t border-line bg-canvas/95 px-4 pt-3 backdrop-blur"
			style:padding-bottom="calc(0.75rem + env(safe-area-inset-bottom))"
		>
			<Button fullWidth size="lg" onclick={next} disabled={!canContinue}>
				{step === 3 ? 'Buat trip' : 'Lanjut'}
			</Button>
			{#if step === 3}
				<button
					type="button"
					class="mt-1 min-h-11 w-full text-sm text-muted transition hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
					onclick={finish}
				>
					Lewati dulu
				</button>
			{/if}
		</div>
	</div>
{/if}
