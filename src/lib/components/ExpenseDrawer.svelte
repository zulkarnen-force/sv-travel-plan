<script lang="ts">
	import clsx from 'clsx';
	import { currencySymbol, EXPENSE_BASES, EXPENSE_CATEGORIES } from '#lib/config';
	import type { ExpenseInput } from '#lib/state.svelte';
	import type { Expense, ExpenseBasis, ExpenseCategoryId, Trip } from '#lib/types';
	import { autoQuantity } from '#lib/utils/budget';
	import { formatMoney } from '#lib/utils/format';
	import Drawer from './ui/Drawer.svelte';
	import Button from './ui/Button.svelte';
	import Input from './ui/Input.svelte';
	import Label from './ui/Label.svelte';
	import Stepper from './ui/Stepper.svelte';

	interface Props {
		open?: boolean;
		expense?: Expense | null;
		trip: Trip;
		onsave: (input: ExpenseInput) => void;
		ondelete?: (expense: Expense) => void;
	}

	let { open = $bindable(false), expense = null, trip, onsave, ondelete }: Props = $props();

	let name = $state('');
	let category = $state<ExpenseCategoryId>('other');
	let priceInput = $state('');
	let basis = $state<ExpenseBasis>('once');
	let quantity = $state(1);
	let quantityTouched = $state(false);

	const formId = 'expense-form';

	const price = $derived(
		priceInput.trim() === '' ? null : Number(priceInput.trim().replace(',', '.'))
	);
	const validPrice = $derived(price !== null && Number.isFinite(price) && price >= 0);
	const valid = $derived(name.trim().length > 0 && validPrice);
	const total = $derived(validPrice && price !== null ? price * quantity : 0);

	$effect(() => {
		if (!open) return;
		name = expense?.name ?? '';
		category = expense?.category ?? 'other';
		priceInput =
			expense?.unitPrice !== null && expense?.unitPrice !== undefined
				? String(expense.unitPrice)
				: '';
		basis = expense?.basis ?? 'once';
		quantity = expense?.quantity ?? autoQuantity(basis, trip);
		quantityTouched = expense?.quantityEdited ?? false;
	});

	function chooseBasis(next: ExpenseBasis) {
		if (basis === next) return;
		basis = next;
		if (!quantityTouched) quantity = autoQuantity(next, trip);
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!valid || price === null) return;
		onsave({
			name: name.trim(),
			category,
			unitPrice: price,
			basis,
			quantity,
			quantityEdited: quantityTouched
		});
		open = false;
	}

	function remove() {
		if (!expense || !ondelete) return;
		ondelete(expense);
		open = false;
	}
</script>

<Drawer
	bind:open
	title={expense ? 'Ubah pengeluaran' : 'Tambah pengeluaran'}
	description={expense
		? 'Cuma rencana belanja — ubah budget, dasar hitungan, atau jumlah.'
		: 'Ini rencana biaya, bukan uang yang udah keluar.'}
>
	{#snippet footer()}
		<div class="space-y-1">
			<Button type="submit" form={formId} fullWidth size="lg" disabled={!valid}>
				{expense ? 'Simpan perubahan' : 'Tambah pengeluaran'}
			</Button>
			{#if expense && ondelete}
				<Button variant="danger" fullWidth onclick={remove}>Hapus pengeluaran</Button>
			{/if}
		</div>
	{/snippet}

	<form id={formId} class="space-y-4" onsubmit={submit}>
		<div>
			<Label for="expense-name">Nama</Label>
			<Input
				id="expense-name"
				bind:value={name}
				maxlength={120}
				placeholder="Hotel"
				autofocus
				class="mt-2"
			/>
		</div>

		<div>
			<Label>Kategori</Label>
			<div class="mt-2 grid grid-cols-2 gap-2" role="group" aria-label="Kategori pengeluaran">
				{#each EXPENSE_CATEGORIES as option (option.id)}
					<button
						type="button"
						class={clsx(
							'flex min-h-11 items-center gap-2 rounded-[18px] px-3 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none',
							category === option.id
								? 'bg-lime text-on-lime'
								: 'bg-surface text-ink hover:bg-line/60'
						)}
						aria-pressed={category === option.id}
						onclick={() => (category = option.id)}
					>
						<span
							class="h-2.5 w-2.5 shrink-0 rounded-full"
							style:background={option.color}
							aria-hidden="true"
						></span>
						{option.label}
					</button>
				{/each}
			</div>
		</div>

		<div>
			<Label for="expense-price">Budget satuan ({currencySymbol(trip.currency)})</Label>
			<Input
				id="expense-price"
				bind:value={priceInput}
				inputmode="decimal"
				placeholder="0"
				class="mt-2"
				aria-invalid={priceInput.trim() !== '' && !validPrice}
				aria-describedby={priceInput.trim() !== '' && !validPrice
					? 'expense-price-error'
					: undefined}
			/>
			{#if priceInput.trim() !== '' && !validPrice}
				<p id="expense-price-error" class="mt-1 text-xs text-critical">
					Isi budget 0 atau lebih ya.
				</p>
			{/if}
		</div>

		<div>
			<Label>Dasar hitungan</Label>
			<div class="mt-2 grid grid-cols-2 gap-2" role="group" aria-label="Dasar hitungan">
				{#each EXPENSE_BASES as option (option.id)}
					<button
						type="button"
						class={clsx(
							'min-h-11 rounded-[18px] px-3 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none',
							basis === option.id ? 'bg-lime text-on-lime' : 'bg-surface text-ink hover:bg-line/60'
						)}
						aria-pressed={basis === option.id}
						onclick={() => chooseBasis(option.id)}
					>
						{option.label}
					</button>
				{/each}
			</div>
		</div>

		<div class="flex items-center justify-between gap-3">
			<div>
				<Label>Jumlah</Label>
				<p class="mt-1 text-[11px] text-muted">
					{quantityTouched ? 'Kamu atur sendiri' : 'Otomatis dari lama trip'}
				</p>
			</div>
			<Stepper
				bind:value={quantity}
				label={name.trim() || 'pengeluaran'}
				onchange={() => (quantityTouched = true)}
			/>
		</div>

		<div class="flex items-center justify-between gap-3 rounded-[18px] bg-surface px-4 py-3">
			<span class="text-xs text-muted">
				{validPrice ? `${formatMoney(price ?? 0, trip.currency)} × ${quantity}` : 'Tambah budget'}
			</span>
			<span class="text-lg font-medium text-ink tabular-nums">
				{validPrice ? formatMoney(total, trip.currency) : '—'}
			</span>
		</div>
	</form>
</Drawer>
