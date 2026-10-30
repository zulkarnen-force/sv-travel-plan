import { Backpack, Droplets, FileText, Pill, Shirt, Smartphone } from '@lucide/svelte';
import type { Component } from 'svelte';
import type { PrepCategory } from '../types';

export const DEFAULT_PREP_CATEGORY_ICON = 'backpack';

const PREP_CATEGORY_ICONS: Record<string, Component> = {
	shirt: Shirt,
	toiletries: Droplets,
	documents: FileText,
	electronics: Smartphone,
	medicine: Pill,
	backpack: Backpack
};

export const PREP_CATEGORY_PRESETS: { name: string; icon: string }[] = [
	{ name: 'Perlengkapan mandi', icon: 'toiletries' },
	{ name: 'Dokumen', icon: 'documents' },
	{ name: 'Elektronik', icon: 'electronics' },
	{ name: 'Obat-obatan', icon: 'medicine' }
];

const ICON_KEYWORDS: { icon: string; words: string[] }[] = [
	{
		icon: 'toiletries',
		words: ['mandi', 'toiletries', 'sabun', 'sampo', 'shampoo', 'skincare', 'perawatan']
	},
	{
		icon: 'documents',
		words: ['dokumen', 'document', 'paspor', 'passport', 'tiket', 'ticket', 'berkas', 'surat']
	},
	{
		icon: 'electronics',
		words: ['elektronik', 'electronic', 'charger', 'kabel', 'gadget', 'kamera', 'laptop']
	},
	{
		icon: 'medicine',
		words: ['obat', 'medicine', 'medis', 'p3k', 'kesehatan', 'apotek']
	},
	{ icon: 'shirt', words: ['pakaian', 'baju', 'clothing', 'shirt'] }
];

/** Picks a sensible icon from the category name so adding one stays a single field. */
export function inferPrepCategoryIcon(name: string): string {
	const normalized = name.toLowerCase();
	return (
		ICON_KEYWORDS.find(({ words }) => words.some((word) => normalized.includes(word)))?.icon ??
		DEFAULT_PREP_CATEGORY_ICON
	);
}

export function prepCategoryIcon(category: Pick<PrepCategory, 'icon' | 'name'>): Component {
	return (
		PREP_CATEGORY_ICONS[category.icon] ??
		PREP_CATEGORY_ICONS[inferPrepCategoryIcon(category.name)] ??
		Backpack
	);
}
