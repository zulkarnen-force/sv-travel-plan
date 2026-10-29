import type { EntryType, ExpenseBasis, ExpenseCategoryId, PurposeId, Suggestion } from './types';

/* ------------------------------------------------------------------ */
/* Purposes                                                            */
/* ------------------------------------------------------------------ */

export interface PurposeMeta {
	id: PurposeId;
	label: string;
	hint: string;
}

export const PURPOSES: PurposeMeta[] = [
	{ id: 'general', label: 'Umum', hint: 'Sedikit dari semuanya' },
	{ id: 'leisure', label: 'Santai', hint: 'Hari santai, tanpa jadwal' },
	{ id: 'beach', label: 'Pantai', hint: 'Matahari, pasir, dan baju renang' },
	{ id: 'business', label: 'Bisnis', hint: 'Meeting dan baju rapi' },
	{ id: 'hiking', label: 'Naik gunung', hint: 'Jalur dan baju berlapis' },
	{ id: 'city', label: 'Jalan-jalan kota', hint: 'Jalan kaki dan sepatu nyaman' },
	{ id: 'family', label: 'Keluarga', hint: 'Anak kecil, baju ekstra' }
];

export function purposeLabel(id: PurposeId): string {
	return PURPOSES.find((purpose) => purpose.id === id)?.label ?? 'Umum';
}

/* ------------------------------------------------------------------ */
/* Itinerary entry types                                               */
/* ------------------------------------------------------------------ */

export const ENTRY_TYPES: { id: EntryType; label: string }[] = [
	{ id: 'transport', label: 'Transport' },
	{ id: 'stay', label: 'Penginapan' },
	{ id: 'food', label: 'Makan' },
	{ id: 'activity', label: 'Kegiatan' },
	{ id: 'other', label: 'Lainnya' }
];

/* ------------------------------------------------------------------ */
/* Packing suggestions — edit this file to change the rules            */
/* ------------------------------------------------------------------ */

type QuantityRule = (days: number) => number;

export interface DurationRule {
	name: string;
	quantity: QuantityRule;
}

type PurposeRule =
	| { type: 'add'; name: string; quantity: QuantityRule }
	| { type: 'replace'; from: string; to: string }
	| { type: 'boost'; name: string; amount: number };

const cappedAt = (value: number, cap: number) => Math.min(value, cap);

export const DURATION_RULES: DurationRule[] = [
	{ name: 'Celana dalam', quantity: (days) => cappedAt(days, 7) },
	{ name: 'Kaus kaki', quantity: (days) => cappedAt(days, 7) },
	{ name: 'Kaos atau atasan', quantity: (days) => cappedAt(days, 7) },
	{
		name: 'Bawahan (celana, celana pendek, rok)',
		quantity: (days) => Math.min(5, Math.max(2, Math.ceil(days / 2)))
	},
	{ name: 'Baju tidur', quantity: (days) => (days <= 4 ? 1 : 2) },
	{ name: 'Jaket tipis', quantity: () => 1 }
];

export const PURPOSE_RULES: Record<PurposeId, PurposeRule[]> = {
	general: [],
	leisure: [],
	beach: [
		{ type: 'add', name: 'Baju renang', quantity: () => 2 },
		{ type: 'add', name: 'Baju pantai', quantity: () => 1 },
		{ type: 'add', name: 'Sandal', quantity: () => 1 },
		{ type: 'add', name: 'Topi', quantity: () => 1 }
	],
	business: [
		{
			type: 'add',
			name: 'Kemeja atau blus',
			quantity: (days) => Math.min(5, Math.max(1, days))
		},
		{ type: 'add', name: 'Sepatu formal', quantity: () => 1 },
		{ type: 'add', name: 'Blazer', quantity: () => 1 },
		{ type: 'add', name: 'Ikat pinggang', quantity: () => 1 }
	],
	hiking: [
		{ type: 'replace', from: 'Kaos atau atasan', to: 'Kaos cepat kering' },
		{ type: 'add', name: 'Sepatu gunung', quantity: () => 1 },
		{ type: 'add', name: 'Jas hujan', quantity: () => 1 },
		{ type: 'add', name: 'Kaus kaki ekstra', quantity: () => 2 }
	],
	city: [
		{ type: 'add', name: 'Sepatu jalan yang nyaman', quantity: () => 1 },
		{ type: 'add', name: 'Baju kasual rapi', quantity: () => 1 }
	],
	family: [
		{ type: 'add', name: 'Baju cadangan buat anak', quantity: () => 2 },
		{ type: 'boost', name: 'Kaos atau atasan', amount: 2 }
	]
};

/**
 * Builds the suggested Clothing list for a trip length and purpose.
 * Pure function: the same inputs always produce the same list.
 */
export function buildSuggestions(days: number, purpose: PurposeId): Suggestion[] {
	const safeDays = Math.max(1, Math.round(days));
	const suggestions: Suggestion[] = DURATION_RULES.map((rule) => ({
		name: rule.name,
		quantity: Math.max(1, rule.quantity(safeDays))
	}));

	for (const rule of PURPOSE_RULES[purpose] ?? []) {
		if (rule.type === 'replace') {
			const item = suggestions.find((candidate) => candidate.name === rule.from);
			if (item) item.name = rule.to;
		} else if (rule.type === 'boost') {
			const item = suggestions.find((candidate) => candidate.name === rule.name);
			if (item) item.quantity += rule.amount;
		} else {
			const existing = suggestions.find((candidate) => candidate.name === rule.name);
			if (existing) existing.quantity = Math.max(existing.quantity, rule.quantity(safeDays));
			else suggestions.push({ name: rule.name, quantity: Math.max(1, rule.quantity(safeDays)) });
		}
	}

	return suggestions;
}

export const LAUNDRY_TIP =
	'Bawa kebutuhan 7 hari dan sisipin waktu buat laundry. Daftarnya dibatasi biar bawaanmu lebih ringan.';

/* ------------------------------------------------------------------ */
/* Budget                                                              */
/* ------------------------------------------------------------------ */

export interface ExpenseCategoryMeta {
	id: ExpenseCategoryId;
	label: string;
	color: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategoryMeta[] = [
	{ id: 'hotel', label: 'Hotel', color: 'var(--chart-1)' },
	{ id: 'eat', label: 'Makan & minum', color: 'var(--chart-2)' },
	{ id: 'laundry', label: 'Laundry', color: 'var(--chart-3)' },
	{ id: 'transport', label: 'Transport', color: 'var(--chart-4)' },
	{ id: 'activities', label: 'Aktivitas', color: 'var(--chart-5)' },
	{ id: 'other', label: 'Lainnya', color: 'var(--chart-6)' }
];

export function expenseCategoryLabel(id: ExpenseCategoryId): string {
	return EXPENSE_CATEGORIES.find((category) => category.id === id)?.label ?? 'Lainnya';
}

export function expenseCategoryColor(id: ExpenseCategoryId): string {
	return EXPENSE_CATEGORIES.find((category) => category.id === id)?.color ?? 'var(--chart-6)';
}

export const EXPENSE_BASES: { id: ExpenseBasis; label: string; short: string }[] = [
	{ id: 'night', label: 'Per malam', short: 'malam' },
	{ id: 'day', label: 'Per hari', short: 'hari' },
	{ id: 'item', label: 'Per item', short: 'item' },
	{ id: 'once', label: 'Sekali', short: 'sekali' }
];

export function expenseBasisLabel(id: ExpenseBasis): string {
	return EXPENSE_BASES.find((basis) => basis.id === id)?.label ?? 'Sekali';
}

export interface StarterExpenseMeta {
	name: string;
	category: ExpenseCategoryId;
	basis: ExpenseBasis;
	onlyIfLong?: boolean;
}

export const STARTER_EXPENSES: StarterExpenseMeta[] = [
	{ name: 'Hotel', category: 'hotel', basis: 'night' },
	{ name: 'Makan & minum', category: 'eat', basis: 'day' },
	{ name: 'Laundry', category: 'laundry', basis: 'item', onlyIfLong: true }
];

/* ------------------------------------------------------------------ */
/* Currency                                                            */
/* ------------------------------------------------------------------ */

export const CURRENCIES = [
	'USD',
	'EUR',
	'GBP',
	'JPY',
	'CHF',
	'CAD',
	'AUD',
	'NZD',
	'INR',
	'BRL',
	'MXN',
	'ZAR',
	'SEK',
	'NOK',
	'DKK',
	'PLN',
	'CZK',
	'TRY',
	'AED',
	'SGD',
	'HKD',
	'KRW',
	'CNY',
	'THB',
	'IDR',
	'MYR',
	'PHP',
	'VND',
	'ILS',
	'SAR'
] as const;

/** Currencies that conventionally show no minor units. */
export const ZERO_DECIMAL_CURRENCIES = new Set([
	'JPY',
	'KRW',
	'VND',
	'CLP',
	'ISK',
	'HUF',
	'IDR',
	'PYG',
	'UGX',
	'RWF',
	'XAF',
	'XOF',
	'KMF',
	'DJF',
	'GNF',
	'VUV',
	'XPF'
]);

const REGION_CURRENCY: Record<string, string> = {
	US: 'USD',
	GB: 'GBP',
	IE: 'EUR',
	DE: 'EUR',
	FR: 'EUR',
	ES: 'EUR',
	IT: 'EUR',
	NL: 'EUR',
	PT: 'EUR',
	AT: 'EUR',
	BE: 'EUR',
	FI: 'EUR',
	GR: 'EUR',
	JP: 'JPY',
	CH: 'CHF',
	CA: 'CAD',
	AU: 'AUD',
	NZ: 'NZD',
	IN: 'INR',
	BR: 'BRL',
	MX: 'MXN',
	ZA: 'ZAR',
	SE: 'SEK',
	NO: 'NOK',
	DK: 'DKK',
	PL: 'PLN',
	CZ: 'CZK',
	TR: 'TRY',
	AE: 'AED',
	SG: 'SGD',
	HK: 'HKD',
	KR: 'KRW',
	CN: 'CNY',
	TH: 'THB',
	ID: 'IDR',
	MY: 'MYR',
	PH: 'PHP',
	VN: 'VND',
	IL: 'ILS',
	SA: 'SAR'
};

export function detectCurrency(language?: string): string {
	const tag =
		language ?? (typeof navigator !== 'undefined' ? navigator.language : undefined) ?? 'id-ID';
	const parts = tag.replace('_', '-').split('-');
	const region = parts.find((part) => part.length === 2 && part === part.toUpperCase());
	if (region && REGION_CURRENCY[region]) return REGION_CURRENCY[region];
	return 'IDR';
}
