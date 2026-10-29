<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ArrowRight, Plus, Shirt, Sparkles } from '@lucide/svelte';
	import { LAUNDRY_TIP } from '#lib/config';
	import { app } from '#lib/state.svelte';
	import { toast } from '#lib/toast.svelte';
	import { daysBetween } from '#lib/utils/date';
	import ProgressRing from '#lib/components/ProgressRing.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';

	const trip = $derived(app.trip);
	const categories = $derived(app.categories.slice().sort((a, b) => a.order - b.order));
	const totalItems = $derived(app.items.length);
	const packedItems = $derived(app.items.filter((item) => item.packed).length);
	const days = $derived(trip ? daysBetween(trip.startDate, trip.endDate) : 0);
	const hasLaundry = $derived(app.expenses.some((expense) => expense.category === 'laundry'));

	function applySuggestions() {
		const result = app.applySuggestions();
		if (result.added === 0 && result.updated === 0) {
			toast.show('Saran udah paling baru');
			return;
		}
		const parts = [];
		if (result.added > 0) parts.push(`${result.added} ditambah`);
		if (result.updated > 0) parts.push(`${result.updated} diupdate`);
		toast.show(`Daftar bawaan diupdate: ${parts.join(', ')}`);
	}

	function addLaundry() {
		const added = app.addLaundryExpense();
		if (!added) {
			toast.show('Laundry udah ada di budget kamu');
			return;
		}
		toast.show('Laundry ditambah ke budget', {
			label: 'Buka',
			run: () => goto(resolve('/trip/budget'))
		});
	}
</script>

{#if trip}
	<div class="space-y-4 px-4 pt-4 pb-8">
		<header>
			<p class="eyebrow">Bawaan</p>
			<h1 class="mt-1 text-[28px] leading-tight font-medium tracking-[-0.03em] text-ink">
				Nggak ada yang ketinggalan
			</h1>
			<p class="mt-1 text-sm text-muted">
				{packedItems} dari {totalItems} udah dibawa
			</p>
		</header>

		{#if trip.pendingSuggestionUpdate}
			<Card variant="lime" padding="md">
				<div class="flex items-start gap-3">
					<span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-charcoal text-lime">
						<Sparkles size={17} strokeWidth={1.75} />
					</span>
					<div class="min-w-0 flex-1">
						<p class="text-sm leading-snug font-medium text-on-lime">Detail trip berubah</p>
						<p class="mt-1 text-xs leading-relaxed text-on-lime/70">
							Perbarui jumlah dan tambah saran baru. Item yang udah kamu edit atau centang nggak
							diubah.
						</p>
						<Button variant="dark" size="sm" class="mt-3" onclick={applySuggestions}>
							Perbarui saran
						</Button>
					</div>
				</div>
			</Card>
		{/if}

		<div class="space-y-2">
			{#each categories as category (category.id)}
				{@const items = app.itemsForCategory(category.id)}
				{@const packed = items.filter((item) => item.packed).length}
				<a
					href={resolve('/trip/preps/[category]', { category: category.id })}
					class="flex items-center gap-3 rounded-[28px] bg-surface p-4 transition hover:bg-line/40 focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
				>
					<span
						class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-card text-ink"
						aria-hidden="true"
					>
						<Shirt size={19} strokeWidth={1.75} />
					</span>
					<span class="min-w-0 flex-1">
						<span class="block text-[17px] leading-tight font-medium text-ink">{category.name}</span
						>
						<span class="mt-0.5 block text-xs text-muted">
							{items.length === 0
								? 'Tambah item pertama'
								: `${packed} dari ${items.length} udah dibawa`}
						</span>
					</span>
					<ProgressRing {packed} total={items.length} size={64} label={category.name} />
					<ArrowRight size={16} strokeWidth={1.75} class="shrink-0 text-muted" aria-hidden="true" />
				</a>
			{/each}

			<div
				class="flex items-center gap-3 rounded-[28px] border border-dashed border-line p-4"
				aria-label="Tambah kategori, fitur lanjutan"
			>
				<span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface text-muted">
					<Plus size={19} strokeWidth={1.75} />
				</span>
				<span class="min-w-0 flex-1">
					<span class="block text-[15px] font-medium text-ink">Tambah kategori</span>
					<span class="text-xs text-muted">Perlengkapan mandi, dokumen, elektronik</span>
				</span>
				<Badge variant="outline">P1</Badge>
			</div>
		</div>

		{#if days > 7}
			<Card variant="surface" padding="md">
				<p class="eyebrow">Laundry</p>
				<p class="mt-1.5 text-sm leading-relaxed text-muted">{LAUNDRY_TIP}</p>
				{#if hasLaundry}
					<button
						type="button"
						class="mt-2 min-h-11 text-sm font-medium text-ink underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
						onclick={() => goto(resolve('/trip/budget'))}
					>
						Laundry udah di budget →
					</button>
				{:else}
					<Button variant="outline" size="sm" class="mt-3" onclick={addLaundry}>
						Tambah ke budget
					</Button>
				{/if}
			</Card>
		{/if}
	</div>
{/if}
