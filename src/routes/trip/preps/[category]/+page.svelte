<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { ArrowLeft, Check, ChevronDown, MoreVertical, Pencil, Trash2 } from '@lucide/svelte';
	import { app } from '#lib/state.svelte';
	import { toast } from '#lib/toast.svelte';
	import type { PrepItem } from '#lib/types';
	import ActionSheet from '#lib/components/ui/ActionSheet.svelte';
	import type { ActionItem } from '#lib/components/ui/action-sheet';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import Stepper from '#lib/components/ui/Stepper.svelte';
	import PrepItemDrawer from '#lib/components/PrepItemDrawer.svelte';
	import ProgressRing from '#lib/components/ProgressRing.svelte';

	const categoryId = $derived(page.params.category ?? '');
	const category = $derived(
		app.categories.find((candidate) => candidate.id === categoryId) ?? null
	);
	const items = $derived(category ? app.itemsForCategory(category.id) : []);
	const unpacked = $derived(items.filter((item) => !item.packed));
	const packed = $derived(items.filter((item) => item.packed));
	const packedCount = $derived(packed.length);

	let addOpen = $state(false);
	let editOpen = $state(false);
	let actionsOpen = $state(false);
	let packedOpen = $state(false);
	let editingItem = $state<PrepItem | null>(null);
	let actionItem = $state<PrepItem | null>(null);

	const actionItems: ActionItem[] = $derived(
		actionItem
			? [
					{
						label: 'Ubah item',
						description: 'Nama atau jumlah',
						icon: Pencil,
						onselect: () => openEdit(actionItem as PrepItem)
					},
					{
						label: 'Hapus item',
						description: 'Bisa diurungkan dalam 5 detik',
						icon: Trash2,
						danger: true,
						onselect: () => deleteItem(actionItem as PrepItem)
					}
				]
			: []
	);

	$effect(() => {
		if (app.ready && !category) goto(resolve('/trip/preps'), { replace: true });
	});

	function openAdd() {
		editingItem = null;
		addOpen = true;
	}

	function openEdit(item: PrepItem) {
		editingItem = item;
		editOpen = true;
	}

	function openActions(item: PrepItem) {
		actionItem = item;
		actionsOpen = true;
	}

	function saveItem(name: string, quantity: number) {
		if (!category) return;
		if (editingItem) {
			const id = editingItem.id;
			app.updatePrepItem(id, { name, quantity });
			toast.show('Item udah diupdate');
		} else {
			app.addPrepItem(category.id, name, quantity);
		}
		setTimeout(() => {
			editingItem = null;
		}, 320);
	}

	function deleteItem(item: PrepItem) {
		const removed = app.deletePrepItem(item.id);
		if (removed) {
			toast.show('Item dihapus', { label: 'Urungkan', run: () => app.restorePrepItem(removed) });
		}
		if (editingItem?.id === item.id) {
			setTimeout(() => {
				editingItem = null;
			}, 320);
		}
	}
</script>

{#if category}
	<div class="pb-4">
		<div class="px-4 pt-4">
			<a
				href={resolve('/trip/preps')}
				class="inline-flex min-h-11 items-center gap-1 rounded-full pr-3 text-sm text-muted transition hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
			>
				<ArrowLeft size={16} strokeWidth={2} />
				Bawaan
			</a>

			<div class="mt-2 flex items-center gap-4">
				<div class="min-w-0 flex-1">
					<p class="eyebrow">Kategori</p>
					<h1 class="mt-1 text-[28px] leading-tight font-medium tracking-[-0.03em] text-ink">
						{category.name}
					</h1>
					<p class="mt-1 text-sm text-muted" aria-live="polite">
						{packedCount} dari {items.length} udah dibawa
					</p>
				</div>
				<ProgressRing
					packed={packedCount}
					total={items.length}
					size={92}
					stroke={10}
					label={category.name}
				/>
			</div>
		</div>

		<div class="mt-5 px-4">
			{#if items.length === 0}
				<Card variant="surface" padding="lg" class="text-center">
					<p class="text-sm text-muted">
						Belum ada apa-apa. Tambah barang pertama yang nggak mau kamu lupain.
					</p>
					<Button class="mt-3" onclick={openAdd}>Tambah item pertama</Button>
				</Card>
			{:else}
				{#if unpacked.length === 0}
					<Card variant="lime" padding="sm" class="mb-2 text-center">
						<p class="text-sm font-medium text-on-lime">Semua udah dibawa. Mantap.</p>
					</Card>
				{:else}
					<Card variant="surface" padding="none">
						<div class="divide-y divide-line/70 px-3">
							{#each unpacked as item (item.id)}
								<div>
									<div class="flex items-start gap-2 py-3">
										<button
											type="button"
											role="checkbox"
											aria-checked="false"
											aria-label={`Tandai ${item.name} udah dibawa`}
											class="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full transition hover:bg-card focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
											onclick={() => app.togglePacked(item.id)}
										>
											<span
												class="grid h-6 w-6 place-items-center rounded-md border border-line bg-card"
											></span>
										</button>
										<button
											type="button"
											class="min-w-0 flex-1 pt-2 text-left focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
											onclick={() => openEdit(item)}
										>
											<span class="block text-[15px] leading-snug font-medium text-ink"
												>{item.name}</span
											>
											<span class="mt-0.5 block text-[11px] text-muted">
												{item.quantity} unit{item.source === 'manual'
													? ' · kamu tambah sendiri'
													: ''}
											</span>
										</button>
										<button
											type="button"
											class="-mr-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted transition hover:bg-card hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
											aria-label={`Actions for ${item.name}`}
											aria-haspopup="dialog"
											onclick={() => openActions(item)}
										>
											<MoreVertical size={18} strokeWidth={1.75} />
										</button>
									</div>
									<div class="flex items-center justify-end gap-2 pb-3 pl-12">
										<span class="text-[11px] text-muted">Jumlah</span>
										<Stepper
											value={item.quantity}
											label={item.name}
											onchange={(value) => app.updatePrepItem(item.id, { quantity: value })}
										/>
									</div>
								</div>
							{/each}
						</div>
					</Card>
				{/if}

				{#if packedCount > 0}
					<div class="mt-3 rounded-[28px] bg-surface">
						<button
							type="button"
							class="flex min-h-14 w-full items-center gap-2 px-4 text-left text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
							aria-expanded={packedOpen}
							onclick={() => (packedOpen = !packedOpen)}
						>
							<span class="grid h-7 w-7 place-items-center rounded-full bg-success/15 text-success">
								<Check size={14} strokeWidth={2.4} />
							</span>
							<span class="flex-1 text-sm font-medium">Udah dibawa ({packedCount})</span>
							<ChevronDown
								size={18}
								strokeWidth={1.75}
								class={packedOpen ? 'rotate-180 transition-transform' : 'transition-transform'}
							/>
						</button>

						{#if packedOpen}
							<div class="divide-y divide-line/70 border-t border-line/70 px-3">
								{#each packed as item (item.id)}
									<div class="flex items-center gap-2 py-2">
										<button
											type="button"
											role="checkbox"
											aria-checked="true"
											aria-label={`Tandai ${item.name} belum dibawa`}
											class="grid h-11 w-11 shrink-0 place-items-center rounded-full transition hover:bg-card focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
											onclick={() => app.togglePacked(item.id)}
										>
											<span
												class="grid h-6 w-6 place-items-center rounded-md bg-success text-canvas"
											>
												<Check size={14} strokeWidth={2.6} />
											</span>
										</button>
										<button
											type="button"
											class="min-w-0 flex-1 truncate text-left text-sm text-muted line-through focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
											onclick={() => openEdit(item)}
										>
											{item.name}
										</button>
										<span class="text-xs text-muted">×{item.quantity}</span>
										<button
											type="button"
											class="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted transition hover:bg-card hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
											aria-label={`Aksi untuk ${item.name}`}
											aria-haspopup="dialog"
											onclick={() => openActions(item)}
										>
											<MoreVertical size={18} strokeWidth={1.75} />
										</button>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			{/if}
		</div>

		<div class="sticky bottom-0 mt-5 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur">
			<Button fullWidth size="lg" onclick={openAdd}>Tambah item</Button>
		</div>
	</div>
{/if}

<PrepItemDrawer bind:open={addOpen} item={null} onsave={saveItem} />

<PrepItemDrawer bind:open={editOpen} item={editingItem} onsave={saveItem} ondelete={deleteItem} />

<ActionSheet bind:open={actionsOpen} title={actionItem?.name ?? 'Item'} items={actionItems} />
