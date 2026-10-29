import type { Component } from 'svelte';

export interface ActionItem {
	label: string;
	description?: string;
	icon?: Component;
	danger?: boolean;
	onselect: () => void;
}
