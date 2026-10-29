<script lang="ts">
	import clsx from 'clsx';
	import { ENTRY_TYPES } from '#lib/config';
	import type { EntryInput } from '#lib/state.svelte';
	import type { EntryType, ItineraryEntry } from '#lib/types';
	import Drawer from './ui/Drawer.svelte';
	import Button from './ui/Button.svelte';
	import Input from './ui/Input.svelte';
	import Label from './ui/Label.svelte';
	import Textarea from './ui/Textarea.svelte';
	import { ENTRY_ICONS } from './entry-icons';

	interface Props {
		open?: boolean;
		entry?: ItineraryEntry | null;
		dayIndex: number;
		onsave: (input: EntryInput) => void;
		ondelete?: (entry: ItineraryEntry) => void;
	}

	let { open = $bindable(false), entry = null, dayIndex, onsave, ondelete }: Props = $props();

	let title = $state('');
	let time = $state('');
	let place = $state('');
	let notes = $state('');
	let type = $state<EntryType>('activity');

	const valid = $derived(title.trim().length > 0);
	const formId = 'itinerary-entry-form';

	$effect(() => {
		if (!open) return;
		title = entry?.title ?? '';
		time = entry?.time ?? '';
		place = entry?.place ?? '';
		notes = entry?.notes ?? '';
		type = entry?.type ?? 'activity';
	});

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!valid) return;
		onsave({
			dayIndex: entry ? entry.dayIndex : dayIndex,
			title: title.trim(),
			time: time || null,
			place: place.trim(),
			notes: notes.trim(),
			type
		});
		open = false;
	}

	function remove() {
		if (!entry || !ondelete) return;
		ondelete(entry);
		open = false;
	}
</script>

<Drawer
	bind:open
	title={entry ? 'Edit entry' : `Add to Day ${dayIndex + 1}`}
	description={entry
		? 'Change the plan for this day.'
		: 'A title is enough — add details if they help.'}
>
	{#snippet footer()}
		<div class="space-y-1">
			<Button type="submit" form={formId} fullWidth size="lg" disabled={!valid}>
				{entry ? 'Save changes' : 'Add entry'}
			</Button>
			{#if entry && ondelete}
				<Button variant="danger" fullWidth onclick={remove}>Delete entry</Button>
			{/if}
		</div>
	{/snippet}

	<form id={formId} class="space-y-4" onsubmit={submit}>
		<div>
			<Label for="entry-title">Title</Label>
			<Input
				id="entry-title"
				bind:value={title}
				maxlength={120}
				placeholder="Temple visit"
				autofocus
				class="mt-2"
			/>
		</div>

		<div>
			<Label for="entry-time">Time (optional)</Label>
			<Input id="entry-time" type="time" bind:value={time} class="mt-2" />
		</div>

		<div>
			<Label for="entry-place">Place (optional)</Label>
			<Input
				id="entry-place"
				bind:value={place}
				maxlength={160}
				placeholder="Uluwatu Temple"
				class="mt-2"
			/>
		</div>

		<div>
			<Label for="entry-notes">Notes (optional)</Label>
			<Textarea
				id="entry-notes"
				bind:value={notes}
				maxlength={600}
				placeholder="Book tickets the day before"
				class="mt-2"
			/>
		</div>

		<div>
			<Label>Type</Label>
			<div class="mt-2 grid grid-cols-3 gap-2" role="group" aria-label="Entry type">
				{#each ENTRY_TYPES as option (option.id)}
					{@const Icon = ENTRY_ICONS[option.id]}
					<button
						type="button"
						class={clsx(
							'flex min-h-11 items-center justify-center gap-1.5 rounded-[18px] px-2 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none',
							type === option.id ? 'bg-lime text-on-lime' : 'bg-surface text-ink hover:bg-line/60'
						)}
						aria-pressed={type === option.id}
						onclick={() => (type = option.id)}
					>
						<Icon size={15} strokeWidth={1.75} />
						{option.label}
					</button>
				{/each}
			</div>
		</div>
	</form>
</Drawer>
