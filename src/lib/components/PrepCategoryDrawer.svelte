<script lang="ts">
	import {
		DEFAULT_PREP_CATEGORY_ICON,
		inferPrepCategoryIcon,
		PREP_CATEGORY_PRESETS
	} from './prep-icons';
	import Drawer from './ui/Drawer.svelte';
	import Button from './ui/Button.svelte';
	import Input from './ui/Input.svelte';
	import Label from './ui/Label.svelte';

	interface Props {
		open?: boolean;
		existingNames?: string[];
		onsave: (name: string, icon: string) => void;
	}

	let { open = $bindable(false), existingNames = [], onsave }: Props = $props();

	let name = $state('');
	let icon = $state(DEFAULT_PREP_CATEGORY_ICON);

	const trimmed = $derived(name.trim());
	const duplicate = $derived(
		trimmed.length > 0 &&
			existingNames.some((existing) => existing.toLowerCase() === trimmed.toLowerCase())
	);
	const valid = $derived(trimmed.length > 0 && !duplicate);
	const availablePresets = $derived(
		PREP_CATEGORY_PRESETS.filter(
			(preset) =>
				!existingNames.some((existing) => existing.toLowerCase() === preset.name.toLowerCase())
		)
	);
	const formId = 'prep-category-form';

	function reset() {
		name = '';
		icon = DEFAULT_PREP_CATEGORY_ICON;
	}

	function usePreset(preset: { name: string; icon: string }) {
		name = preset.name;
		icon = preset.icon;
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!valid) return;
		onsave(trimmed, icon);
		reset();
		open = false;
	}
</script>

<Drawer
	bind:open
	onclose={reset}
	title="Tambah kategori"
	description="Pisahin bawaan jadi grup biar gampang dicek. Contoh: perlengkapan mandi atau dokumen."
>
	{#snippet footer()}
		<Button type="submit" form={formId} fullWidth size="lg" disabled={!valid}>
			Tambah kategori
		</Button>
	{/snippet}

	<form id={formId} class="space-y-4" onsubmit={submit}>
		<div>
			<Label for="prep-category-name">Nama kategori</Label>
			<Input
				id="prep-category-name"
				bind:value={name}
				oninput={() => (icon = inferPrepCategoryIcon(name))}
				maxlength={40}
				placeholder="Perlengkapan mandi"
				autofocus
				aria-invalid={duplicate}
				aria-describedby={duplicate ? 'prep-category-error' : undefined}
				class="mt-2"
			/>
			{#if duplicate}
				<p id="prep-category-error" class="mt-2 text-xs text-critical" role="alert">
					Kategori ini udah ada. Pakai nama lain ya.
				</p>
			{/if}
		</div>

		{#if availablePresets.length > 0}
			<div>
				<Label>Pilihan cepat</Label>
				<div class="mt-2 flex flex-wrap gap-2">
					{#each availablePresets as preset (preset.name)}
						<button
							type="button"
							class="min-h-11 rounded-full border border-line px-3.5 text-[13px] font-medium text-ink transition hover:bg-surface focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
							onclick={() => usePreset(preset)}
						>
							{preset.name}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</form>
</Drawer>
