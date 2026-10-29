import { browser } from '$app/env';
import { buildSuggestions, DEFAULT_CURRENCY, PURPOSE_RULES, STARTER_EXPENSES } from './config';
import { snapshotSchema } from './schemas';
import type {
	AppSnapshot,
	EntryType,
	Expense,
	ExpenseBasis,
	ExpenseCategoryId,
	ItineraryEntry,
	PrepCategory,
	PrepItem,
	PurposeId,
	Trip,
	TripDraft
} from './types';
import { autoQuantity } from './utils/budget';
import { daysBetween } from './utils/date';
import { uid } from './utils/id';

const STORAGE_KEY = 'trippack:v1';
const BACKUP_KEY = 'trippack:recovered';
const SAVE_DELAY = 120;

export interface CreateTripInput {
	name: string;
	startDate: string;
	endDate: string;
	purpose: PurposeId;
	purposeNote: string;
}

export interface EntryInput {
	dayIndex: number | null;
	title: string;
	time: string | null;
	place: string;
	notes: string;
	type: EntryType;
}

export interface ExpenseInput {
	name: string;
	category: ExpenseCategoryId;
	unitPrice: number | null;
	basis: ExpenseBasis;
	quantity: number;
	quantityEdited: boolean;
}

type TripPatch = Partial<
	Pick<
		Trip,
		'name' | 'startDate' | 'endDate' | 'purpose' | 'purposeNote' | 'currency' | 'budgetTotal'
	>
>;

class AppState {
	trip = $state<Trip | null>(null);
	entries = $state<ItineraryEntry[]>([]);
	categories = $state<PrepCategory[]>([]);
	items = $state<PrepItem[]>([]);
	expenses = $state<Expense[]>([]);
	draft = $state<TripDraft | null>(null);
	storageError = $state<string | null>(null);
	ready = $state(false);

	#saveTimer: ReturnType<typeof setTimeout> | null = null;

	constructor() {
		if (browser) this.#load();
		else this.ready = true;
	}

	/* ---------------------------------------------------------------- */
	/* Persistence                                                       */
	/* ---------------------------------------------------------------- */

	#load() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) {
				this.#persistNow();
				this.ready = true;
				return;
			}

			const result = snapshotSchema.safeParse(JSON.parse(raw));
			if (!result.success) {
				try {
					localStorage.setItem(BACKUP_KEY, raw);
				} catch {
					/* backup is best effort */
				}
				this.storageError =
					'Data trip kamu nggak bisa dibaca. Salinannya tetap disimpan di perangkat ini, jadi kamu bisa mulai trip baru.';
				this.ready = true;
				return;
			}

			const data = result.data;
			this.trip = data.trip;
			this.entries = data.entries;
			this.categories = data.categories;
			this.items = data.items;
			this.expenses = data.expenses;
			this.draft = data.draft;
		} catch {
			this.storageError =
				'Penyimpanan nggak tersedia di browser ini. Perubahan kamu cuma bertahan selama sesi ini.';
		} finally {
			this.ready = true;
		}
	}

	snapshot(): AppSnapshot {
		return {
			version: 1,
			trip: this.trip,
			entries: this.entries,
			categories: this.categories,
			items: this.items,
			expenses: this.expenses,
			draft: this.draft
		};
	}

	persist() {
		if (!browser) return;
		if (this.#saveTimer) clearTimeout(this.#saveTimer);
		this.#saveTimer = setTimeout(() => this.#persistNow(), SAVE_DELAY);
	}

	flush() {
		if (!browser) return;
		if (this.#saveTimer) {
			clearTimeout(this.#saveTimer);
			this.#saveTimer = null;
		}
		this.#persistNow();
	}

	#persistNow() {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.snapshot()));
			this.storageError = null;
		} catch {
			this.storageError =
				'Browser kamu nggak bisa nyimpen perubahan. Biarin tab ini tetap terbuka, atau kosongin ruang penyimpanan.';
		}
	}

	exportJson(): string {
		return JSON.stringify({ ...this.snapshot(), exportedAt: new Date().toISOString() }, null, 2);
	}

	/* ---------------------------------------------------------------- */
	/* Trip                                                              */
	/* ---------------------------------------------------------------- */

	createTrip(input: CreateTripInput) {
		const trip: Trip = {
			id: uid(),
			name: input.name.trim(),
			startDate: input.startDate,
			endDate: input.endDate,
			purpose: input.purpose,
			purposeNote: input.purposeNote.trim(),
			currency: DEFAULT_CURRENCY,
			budgetTotal: null,
			createdAt: new Date().toISOString(),
			activeDay: 0,
			budgetInitialized: false,
			swipeHintSeen: false,
			pendingSuggestionUpdate: false
		};

		const category: PrepCategory = {
			id: uid(),
			tripId: trip.id,
			name: 'Pakaian',
			icon: 'shirt',
			order: 0
		};

		const days = daysBetween(trip.startDate, trip.endDate);
		const suggestions = buildSuggestions(days, trip.purpose);

		this.trip = trip;
		this.entries = [];
		this.expenses = [];
		this.categories = [category];
		this.items = suggestions.map((suggestion, index) => ({
			id: uid(),
			categoryId: category.id,
			name: suggestion.name,
			quantity: suggestion.quantity,
			packed: false,
			source: 'suggested',
			touched: false,
			order: index
		}));
		this.draft = null;
		this.flush();
		return trip;
	}

	/** Returns how many itinerary entries were moved to Unscheduled. */
	updateTrip(patch: TripPatch): number {
		if (!this.trip) return 0;
		const previous = this.trip;
		const next: Trip = { ...previous, ...patch };
		const nextDays = daysBetween(next.startDate, next.endDate);

		next.activeDay = Math.min(Math.max(0, previous.activeDay), nextDays - 1);
		const datesChanged = previous.startDate !== next.startDate || previous.endDate !== next.endDate;
		const purposeChanged = previous.purpose !== next.purpose;
		if (datesChanged || purposeChanged) next.pendingSuggestionUpdate = true;
		this.trip = next;

		let moved = 0;
		for (const entry of this.entries) {
			if (entry.dayIndex !== null && entry.dayIndex >= nextDays) {
				entry.dayIndex = null;
				moved += 1;
			}
		}

		for (const expense of this.expenses) {
			if (expense.quantityEdited) continue;
			expense.quantity = autoQuantity(expense.basis, nextDays);
		}

		this.persist();
		return moved;
	}

	deleteTrip() {
		this.trip = null;
		this.entries = [];
		this.categories = [];
		this.items = [];
		this.expenses = [];
		this.draft = null;
		if (browser) {
			try {
				localStorage.removeItem(STORAGE_KEY);
			} catch {
				/* ignore */
			}
		}
		this.ready = true;
	}

	setActiveDay(index: number) {
		if (!this.trip) return;
		const days = daysBetween(this.trip.startDate, this.trip.endDate);
		this.trip.activeDay = Math.min(Math.max(0, index), days - 1);
		this.persist();
	}

	markSwipeHintSeen() {
		if (!this.trip || this.trip.swipeHintSeen) return;
		this.trip.swipeHintSeen = true;
		this.persist();
	}

	setCurrency(currency: string) {
		if (!this.trip) return;
		this.trip.currency = currency;
		this.persist();
	}

	setBudgetTotal(value: number | null) {
		if (!this.trip) return;
		this.trip.budgetTotal = value;
		this.persist();
	}

	/* ---------------------------------------------------------------- */
	/* Draft                                                             */
	/* ---------------------------------------------------------------- */

	saveDraft(draft: TripDraft) {
		this.draft = draft;
		this.persist();
	}

	clearDraft() {
		this.draft = null;
		this.persist();
	}

	/* ---------------------------------------------------------------- */
	/* Itinerary                                                         */
	/* ---------------------------------------------------------------- */

	#nextOrder(dayIndex: number | null): number {
		const orders = this.entries
			.filter((entry) => entry.dayIndex === dayIndex)
			.map((entry) => entry.order);
		return orders.length ? Math.max(...orders) + 1 : 0;
	}

	entriesForDay(dayIndex: number | null): ItineraryEntry[] {
		return this.entries
			.filter((entry) => entry.dayIndex === dayIndex)
			.slice()
			.sort((a, b) => {
				if (a.time && b.time) return a.time.localeCompare(b.time) || a.order - b.order;
				if (a.time) return -1;
				if (b.time) return 1;
				return a.order - b.order;
			});
	}

	unscheduledEntries(): ItineraryEntry[] {
		return this.entriesForDay(null);
	}

	addEntry(input: EntryInput): ItineraryEntry | null {
		if (!this.trip) return null;
		const entry: ItineraryEntry = {
			id: uid(),
			tripId: this.trip.id,
			dayIndex: input.dayIndex,
			title: input.title.trim(),
			time: input.time || null,
			place: input.place.trim(),
			notes: input.notes.trim(),
			type: input.type,
			order: this.#nextOrder(input.dayIndex),
			createdAt: new Date().toISOString()
		};
		this.entries.push(entry);
		this.persist();
		return entry;
	}

	updateEntry(id: string, patch: Partial<Omit<ItineraryEntry, 'id' | 'tripId'>>) {
		const entry = this.entries.find((candidate) => candidate.id === id);
		if (!entry) return;
		Object.assign(entry, patch);
		if (typeof patch.title === 'string') entry.title = patch.title.trim();
		this.persist();
	}

	deleteEntry(id: string): ItineraryEntry | null {
		const index = this.entries.findIndex((entry) => entry.id === id);
		if (index === -1) return null;
		const [removed] = this.entries.splice(index, 1);
		this.persist();
		return removed;
	}

	restoreEntry(entry: ItineraryEntry) {
		this.entries.push(entry);
		this.persist();
	}

	duplicateEntry(id: string): ItineraryEntry | null {
		const source = this.entries.find((entry) => entry.id === id);
		if (!source) return null;
		const copy: ItineraryEntry = {
			...source,
			id: uid(),
			order: this.#nextOrder(source.dayIndex),
			createdAt: new Date().toISOString()
		};
		this.entries.push(copy);
		this.persist();
		return copy;
	}

	moveEntry(id: string, dayIndex: number | null) {
		const entry = this.entries.find((candidate) => candidate.id === id);
		if (!entry) return;
		entry.dayIndex = dayIndex;
		entry.order = this.#nextOrder(dayIndex);
		this.persist();
	}

	/* ---------------------------------------------------------------- */
	/* Preps                                                             */
	/* ---------------------------------------------------------------- */

	clothingCategory(): PrepCategory | null {
		return (
			this.categories.find((category) => category.icon === 'shirt') ??
			this.categories.find((category) => category.name === 'Pakaian') ??
			this.categories[0] ??
			null
		);
	}

	itemsForCategory(categoryId: string): PrepItem[] {
		return this.items
			.filter((item) => item.categoryId === categoryId)
			.slice()
			.sort((a, b) => a.order - b.order);
	}

	applySuggestions(): { added: number; updated: number } {
		if (!this.trip) return { added: 0, updated: 0 };
		let category = this.clothingCategory();
		if (!category) {
			category = {
				id: uid(),
				tripId: this.trip.id,
				name: 'Pakaian',
				icon: 'shirt',
				order: this.categories.length
			};
			this.categories.push(category);
		}

		const days = daysBetween(this.trip.startDate, this.trip.endDate);
		const suggestions = buildSuggestions(days, this.trip.purpose);
		const existing = this.itemsForCategory(category.id);
		let nextOrder = existing.length ? Math.max(...existing.map((item) => item.order)) + 1 : 0;
		let added = 0;
		const updatedIds: string[] = [];

		// Purpose rules can replace an item (for example, T-shirts become quick-dry
		// tops for hiking). Rename untouched items instead of leaving a duplicate.
		for (const rule of PURPOSE_RULES[this.trip.purpose] ?? []) {
			if (rule.type !== 'replace') continue;
			const match = existing.find((item) => item.name.toLowerCase() === rule.from.toLowerCase());
			const targetExists = existing.some(
				(item) => item.name.toLowerCase() === rule.to.toLowerCase()
			);
			if (match && !match.touched && !match.packed && !targetExists) {
				match.name = rule.to;
				if (!updatedIds.includes(match.id)) updatedIds.push(match.id);
			}
		}

		for (const suggestion of suggestions) {
			const match = existing.find(
				(item) => item.name.toLowerCase() === suggestion.name.toLowerCase()
			);

			if (!match) {
				this.items.push({
					id: uid(),
					categoryId: category.id,
					name: suggestion.name,
					quantity: suggestion.quantity,
					packed: false,
					source: 'suggested',
					touched: false,
					order: nextOrder++
				});
				added += 1;
			} else if (!match.touched && !match.packed && match.quantity !== suggestion.quantity) {
				match.quantity = suggestion.quantity;
				if (!updatedIds.includes(match.id)) updatedIds.push(match.id);
			}
		}

		this.trip.pendingSuggestionUpdate = false;
		this.persist();
		return { added, updated: updatedIds.length };
	}

	addPrepItem(categoryId: string, name: string, quantity: number): PrepItem | null {
		if (!this.trip) return null;
		const existing = this.itemsForCategory(categoryId);
		const item: PrepItem = {
			id: uid(),
			categoryId,
			name: name.trim(),
			quantity: Math.max(1, Math.round(quantity)),
			packed: false,
			source: 'manual',
			touched: true,
			order: existing.length ? Math.max(...existing.map((candidate) => candidate.order)) + 1 : 0
		};
		this.items.push(item);
		this.persist();
		return item;
	}

	updatePrepItem(id: string, patch: Partial<Pick<PrepItem, 'name' | 'quantity' | 'packed'>>) {
		const item = this.items.find((candidate) => candidate.id === id);
		if (!item) return;
		Object.assign(item, patch);
		if (typeof patch.name === 'string') item.name = patch.name.trim();
		if (patch.name !== undefined || patch.quantity !== undefined) item.touched = true;
		this.persist();
	}

	togglePacked(id: string) {
		const item = this.items.find((candidate) => candidate.id === id);
		if (!item) return;
		item.packed = !item.packed;
		item.touched = true;
		this.persist();
	}

	deletePrepItem(id: string): PrepItem | null {
		const index = this.items.findIndex((item) => item.id === id);
		if (index === -1) return null;
		const [removed] = this.items.splice(index, 1);
		this.persist();
		return removed;
	}

	restorePrepItem(item: PrepItem) {
		this.items.push(item);
		this.persist();
	}

	/* ---------------------------------------------------------------- */
	/* Budget                                                            */
	/* ---------------------------------------------------------------- */

	#makeExpense(input: ExpenseInput): Expense {
		return {
			id: uid(),
			tripId: this.trip?.id ?? '',
			name: input.name.trim(),
			category: input.category,
			unitPrice: input.unitPrice,
			basis: input.basis,
			quantity: Math.max(1, Math.round(input.quantity)),
			quantityEdited: input.quantityEdited
		};
	}

	initBudget(): number {
		if (!this.trip || this.trip.budgetInitialized) return 0;
		this.trip.budgetInitialized = true;
		const days = daysBetween(this.trip.startDate, this.trip.endDate);
		let added = 0;

		for (const starter of STARTER_EXPENSES) {
			if (starter.onlyIfLong && days <= 7) continue;
			if (
				this.expenses.some((expense) => expense.name.toLowerCase() === starter.name.toLowerCase())
			) {
				continue;
			}
			this.expenses.push(
				this.#makeExpense({
					name: starter.name,
					category: starter.category,
					unitPrice: null,
					basis: starter.basis,
					quantity: autoQuantity(starter.basis, days),
					quantityEdited: false
				})
			);
			added += 1;
		}

		this.persist();
		return added;
	}

	addStarterRows(): number {
		if (!this.trip) return 0;
		const days = daysBetween(this.trip.startDate, this.trip.endDate);
		let added = 0;
		for (const starter of STARTER_EXPENSES) {
			if (starter.onlyIfLong && days <= 7) continue;
			if (
				this.expenses.some((expense) => expense.name.toLowerCase() === starter.name.toLowerCase())
			) {
				continue;
			}
			this.expenses.push(
				this.#makeExpense({
					name: starter.name,
					category: starter.category,
					unitPrice: null,
					basis: starter.basis,
					quantity: autoQuantity(starter.basis, days),
					quantityEdited: false
				})
			);
			added += 1;
		}
		this.persist();
		return added;
	}

	addExpense(input: ExpenseInput): Expense | null {
		if (!this.trip) return null;
		const expense = this.#makeExpense(input);
		this.expenses.push(expense);
		this.persist();
		return expense;
	}

	updateExpense(id: string, patch: Partial<Omit<Expense, 'id' | 'tripId'>>) {
		const expense = this.expenses.find((candidate) => candidate.id === id);
		if (!expense) return;
		Object.assign(expense, patch);
		if (typeof patch.name === 'string') expense.name = patch.name.trim();
		this.persist();
	}

	deleteExpense(id: string): Expense | null {
		const index = this.expenses.findIndex((expense) => expense.id === id);
		if (index === -1) return null;
		const [removed] = this.expenses.splice(index, 1);
		this.persist();
		return removed;
	}

	restoreExpense(expense: Expense) {
		this.expenses.push(expense);
		this.persist();
	}

	addLaundryExpense(): boolean {
		if (!this.trip) return false;
		if (this.expenses.some((expense) => expense.category === 'laundry')) return false;
		this.expenses.push(
			this.#makeExpense({
				name: 'Laundry',
				category: 'laundry',
				unitPrice: null,
				basis: 'item',
				quantity: 1,
				quantityEdited: false
			})
		);
		this.persist();
		return true;
	}
}

export const app = new AppState();
