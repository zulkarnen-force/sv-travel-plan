export const PURPOSE_IDS = [
	'general',
	'leisure',
	'beach',
	'business',
	'hiking',
	'city',
	'family'
] as const;
export type PurposeId = (typeof PURPOSE_IDS)[number];

export const ENTRY_TYPE_IDS = ['transport', 'stay', 'food', 'activity', 'other'] as const;
export type EntryType = (typeof ENTRY_TYPE_IDS)[number];

export const EXPENSE_CATEGORY_IDS = [
	'hotel',
	'eat',
	'laundry',
	'transport',
	'activities',
	'other'
] as const;
export type ExpenseCategoryId = (typeof EXPENSE_CATEGORY_IDS)[number];

export const EXPENSE_BASIS_IDS = ['night', 'day', 'item', 'once'] as const;
export type ExpenseBasis = (typeof EXPENSE_BASIS_IDS)[number];

export interface Trip {
	id: string;
	name: string;
	startDate: string;
	endDate: string;
	purpose: PurposeId;
	purposeNote: string;
	currency: string;
	budgetTotal: number | null;
	createdAt: string;
	/** Last viewed itinerary day, kept so a reload lands in the same place. */
	activeDay: number;
	/** Starter budget rows are only offered once. */
	budgetInitialized: boolean;
	/** The one-time swipe hint is dismissed after the first day change. */
	swipeHintSeen: boolean;
	/** Set when dates or purpose change, until suggestions are applied. */
	pendingSuggestionUpdate: boolean;
}

export interface ItineraryEntry {
	id: string;
	tripId: string;
	/** 0-based. Null means the entry is in the Unscheduled holding list. */
	dayIndex: number | null;
	title: string;
	time: string | null;
	place: string;
	notes: string;
	type: EntryType;
	order: number;
	createdAt: string;
}

export interface PrepCategory {
	id: string;
	tripId: string;
	name: string;
	icon: string;
	order: number;
}

export interface PrepItem {
	id: string;
	categoryId: string;
	name: string;
	quantity: number;
	packed: boolean;
	source: 'suggested' | 'manual';
	touched: boolean;
	order: number;
}

export interface Expense {
	id: string;
	tripId: string;
	name: string;
	category: ExpenseCategoryId;
	unitPrice: number | null;
	basis: ExpenseBasis;
	quantity: number;
	quantityEdited: boolean;
}

export interface TripDraft {
	step: number;
	name: string;
	startDate: string | null;
	endDate: string | null;
	purpose: PurposeId;
	purposeNote: string;
}

export interface AppSnapshot {
	version: 1;
	trip: Trip | null;
	entries: ItineraryEntry[];
	categories: PrepCategory[];
	items: PrepItem[];
	expenses: Expense[];
	draft: TripDraft | null;
}

export interface Suggestion {
	name: string;
	quantity: number;
}

export type Tone = 'neutral' | 'primary' | 'warning' | 'critical' | 'success';

export interface Insight {
	id: string;
	text: string;
	tone: Tone;
}
