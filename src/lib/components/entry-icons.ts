import { BedDouble, CircleEllipsis, MapPin, Plane, Utensils } from '@lucide/svelte';
import type { Component } from 'svelte';
import type { EntryType } from '../types';

export const ENTRY_ICONS: Record<EntryType, Component> = {
	transport: Plane,
	stay: BedDouble,
	food: Utensils,
	activity: MapPin,
	other: CircleEllipsis
};

export const ENTRY_LABELS: Record<EntryType, string> = {
	transport: 'Transport',
	stay: 'Stay',
	food: 'Food',
	activity: 'Activity',
	other: 'Other'
};
