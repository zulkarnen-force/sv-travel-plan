<script lang="ts">
	import type { PrepItem } from '#lib/types';
	import Drawer from './ui/Drawer.svelte';
	import Button from './ui/Button.svelte';
	import Input from './ui/Input.svelte';
	import Label from './ui/Label.svelte';
	import Stepper from './ui/Stepper.svelte';

	interface Props {
		open?: boolean;
		item?: PrepItem | null;
		onsave: (name: string, quantity: number) => void;
		ondelete?: (item: PrepItem) => void;
	}

	let { open = $bindable(false), item = null, onsave, ondelete }: Props = $props();

	let name = $state('');
	let quantity = $state(1);

	const valid = $derived(name.trim().length > 0);
	const formId = 'prep-item-form';

	$effect(() => {
		if (!open) return;
		name = item?.name ?? '';
		quantity = item?.quantity ?? 1;
	});

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!valid) return;
		onsave(name.trim(), quantity);
		open = false;
	}

	function remove() {
		if (!item || !ondelete) return;
		ondelete(item);
		open = false;
	}
</script>

<Drawer
	bind:open
	title={item ? 'Ubah item' : 'Tambah item'}
	description={item
		? 'Ubah nama atau jumlah yang mau kamu bawa.'
		: 'Progres ngitung item, bukan unit. Jaket dengan jumlah 2 tetap dihitung satu item.'}
>
	{#snippet footer()}
		<div class="space-y-1">
			<Button type="submit" form={formId} fullWidth size="lg" disabled={!valid}>
				{item ? 'Simpan perubahan' : 'Tambah item'}
			</Button>
			{#if item && ondelete}
				<Button variant="danger" fullWidth onclick={remove}>Hapus item</Button>
			{/if}
		</div>
	{/snippet}

	<form id={formId} class="space-y-4" onsubmit={submit}>
		<div>
			<Label for="prep-item-name">Nama</Label>
			<Input
				id="prep-item-name"
				bind:value={name}
				maxlength={120}
				placeholder="Jaket"
				autofocus
				class="mt-2"
			/>
		</div>

		<div>
			<Label>Jumlah</Label>
			<div class="mt-2">
				<Stepper bind:value={quantity} label={name.trim() || 'item'} />
			</div>
		</div>
	</form>
</Drawer>
