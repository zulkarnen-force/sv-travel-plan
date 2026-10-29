<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { CalendarDays, Download, MoreHorizontal, Pencil, Trash2 } from '@lucide/svelte';
	import { purposeLabel } from '#lib/config';
	import { app } from '#lib/state.svelte';
	import { toast } from '#lib/toast.svelte';
	import type { PurposeId, Trip } from '#lib/types';
	import { daysBetween, formatRange } from '#lib/utils/date';
	import ActionSheet from './ui/ActionSheet.svelte';
	import type { ActionItem } from './ui/action-sheet';
	import Button from './ui/Button.svelte';
	import Drawer from './ui/Drawer.svelte';
	import TripEditForm from './TripEditForm.svelte';

	interface Props {
		trip: Trip;
	}

	let { trip }: Props = $props();

	let menuOpen = $state(false);
	let editOpen = $state(false);
	let deleteOpen = $state(false);

	const days = $derived(daysBetween(trip.startDate, trip.endDate));

	function exportTrip() {
		if (!app.trip) return;
		const slug =
			app.trip.name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '') || 'trip';
		const blob = new Blob([app.exportJson()], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `${slug}.json`;
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
		toast.show('Trip exported as JSON.');
	}

	const menuItems: ActionItem[] = [
		{
			label: 'Edit trip',
			description: 'Name, dates, purpose and note',
			icon: Pencil,
			onselect: () => (editOpen = true)
		},
		{
			label: 'Export trip',
			description: 'Download a private JSON backup',
			icon: Download,
			onselect: exportTrip
		},
		{
			label: 'Delete trip',
			description: 'Remove it from this device',
			icon: Trash2,
			danger: true,
			onselect: () => (deleteOpen = true)
		}
	];

	function saveTrip(input: {
		name: string;
		startDate: string;
		endDate: string;
		purpose: PurposeId;
		purposeNote: string;
	}) {
		const moved = app.updateTrip(input);
		editOpen = false;

		if (moved > 0) {
			toast.show(`${moved} ${moved === 1 ? 'entry' : 'entries'} moved to Unscheduled.`, {
				label: 'Review',
				run: () => goto(resolve('/trip/itinerary'))
			});
		} else {
			toast.show('Trip updated.');
		}
	}

	function deleteTrip() {
		app.deleteTrip();
		deleteOpen = false;
		toast.show('Trip deleted.');
		goto(resolve('/'), { replace: true });
	}
</script>

<header
	class="shrink-0 border-b border-line bg-canvas/95 backdrop-blur"
	style:padding-top="calc(0.75rem + env(safe-area-inset-top))"
>
	<div class="flex items-center gap-2 px-4 pb-2">
		<div class="min-w-0 flex-1">
			<p class="eyebrow truncate">Trip Pack · {purposeLabel(trip.purpose)}</p>
			<h1 class="mt-0.5 truncate text-[21px] leading-tight font-medium tracking-[-0.02em] text-ink">
				{trip.name}
			</h1>
		</div>
		<button
			type="button"
			class="grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink transition hover:bg-surface focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
			aria-label="Trip menu"
			aria-haspopup="dialog"
			onclick={() => (menuOpen = true)}
		>
			<MoreHorizontal size={22} strokeWidth={1.75} />
		</button>
	</div>

	<div class="flex items-center gap-2 px-4 pb-3">
		<span
			class="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-ink"
		>
			<CalendarDays size={14} strokeWidth={1.75} />
			{formatRange(trip.startDate, trip.endDate)}
		</span>
		<span class="text-[11px] text-muted">{days} {days === 1 ? 'day' : 'days'}</span>
	</div>
</header>

<ActionSheet
	bind:open={menuOpen}
	title="Trip"
	description="Everything stays on this device."
	items={menuItems}
/>

<Drawer bind:open={editOpen} title="Edit trip" description="Changes save on this device only.">
	<TripEditForm
		name={trip.name}
		startDate={trip.startDate}
		endDate={trip.endDate}
		purpose={trip.purpose}
		purposeNote={trip.purposeNote}
		onsave={saveTrip}
	/>
</Drawer>

<Drawer
	bind:open={deleteOpen}
	title="Delete this trip?"
	description="This removes the itinerary, packing list and budget from this device. It cannot be undone."
>
	{#snippet footer()}
		<div class="flex gap-2">
			<Button variant="secondary" fullWidth onclick={() => (deleteOpen = false)}>Keep trip</Button>
			<Button variant="critical" fullWidth onclick={deleteTrip}>Delete</Button>
		</div>
	{/snippet}
</Drawer>
