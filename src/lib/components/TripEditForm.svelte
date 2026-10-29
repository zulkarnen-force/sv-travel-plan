<script lang="ts">
	import clsx from 'clsx';
	import { daysBetween, formatLength } from '#lib/utils/date';
	import type { PurposeId } from '#lib/types';
	import RangeCalendar from './RangeCalendar.svelte';
	import PurposeChips from './PurposeChips.svelte';
	import Button from './ui/Button.svelte';
	import Input from './ui/Input.svelte';
	import Label from './ui/Label.svelte';
	import Textarea from './ui/Textarea.svelte';

	interface Props {
		name: string;
		startDate: string | null;
		endDate: string | null;
		purpose: PurposeId;
		purposeNote: string;
		onsave: (input: {
			name: string;
			startDate: string;
			endDate: string;
			purpose: PurposeId;
			purposeNote: string;
		}) => void;
	}

	let {
		name: initialName,
		startDate: initialStart,
		endDate: initialEnd,
		purpose: initialPurpose,
		purposeNote: initialNote,
		onsave
	}: Props = $props();

	// The drawer remounts this form on every open, so initial values are intentional.
	// svelte-ignore state_referenced_locally
	let name = $state(initialName);
	// svelte-ignore state_referenced_locally
	let startDate = $state<string | null>(initialStart);
	// svelte-ignore state_referenced_locally
	let endDate = $state<string | null>(initialEnd);
	// svelte-ignore state_referenced_locally
	let purpose = $state<PurposeId>(initialPurpose);
	// svelte-ignore state_referenced_locally
	let purposeNote = $state(initialNote);

	let days = $derived(startDate && endDate ? daysBetween(startDate, endDate) : 0);
	let valid = $derived(
		name.trim().length >= 1 &&
			name.trim().length <= 60 &&
			Boolean(startDate) &&
			Boolean(endDate) &&
			days <= 60
	);

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!valid || !startDate || !endDate) return;
		onsave({
			name: name.trim(),
			startDate,
			endDate,
			purpose,
			purposeNote: purposeNote.trim()
		});
	}
</script>

<form class="space-y-5" onsubmit={submit}>
	<div>
		<Label for="edit-trip-name">Nama trip</Label>
		<Input
			id="edit-trip-name"
			bind:value={name}
			maxlength={60}
			autocomplete="off"
			autofocus
			class="mt-2"
		/>
		<div class="mt-1.5 flex justify-between text-[11px] text-muted">
			<span>1–60 karakter</span>
			<span>{name.trim().length}/60</span>
		</div>
	</div>

	<div>
		<Label>Tanggal</Label>
		<div class="mt-2">
			<RangeCalendar bind:start={startDate} bind:end={endDate} />
		</div>
		{#if startDate && endDate}
			<div
				class={clsx(
					'mt-2 flex items-center justify-between rounded-full px-4 py-2 text-xs',
					days > 60 ? 'bg-critical/10 text-critical' : 'bg-lime text-on-lime'
				)}
				role="status"
			>
				<span class="font-medium">{formatLength(days)}</span>
				{#if days > 60}<span>Maksimal 60 hari</span>{/if}
			</div>
		{/if}
	</div>

	<div>
		<Label>Tujuan</Label>
		<div class="mt-2">
			<PurposeChips bind:selected={purpose} />
		</div>
	</div>

	<div>
		<Label for="edit-trip-note">Catatan (opsional)</Label>
		<Textarea
			id="edit-trip-note"
			bind:value={purposeNote}
			maxlength={240}
			placeholder="Ada hal yang ngaruh ke bawaan?"
			class="mt-2"
		/>
	</div>

	<p class="text-xs leading-relaxed text-muted">
		Kalau tanggalnya dipendekin, kegiatan di hari yang udah nggak ada bakal disimpan di Belum
		terjadwal. Saran bawaan cuma berubah kalau kamu pilih buat update.
	</p>

	<Button type="submit" fullWidth size="lg" disabled={!valid}>Simpan perubahan</Button>
</form>
