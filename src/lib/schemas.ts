import { z } from 'zod';
import { ENTRY_TYPE_IDS, EXPENSE_BASIS_IDS, EXPENSE_CATEGORY_IDS, PURPOSE_IDS } from './types';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pakai format tanggal YYYY-MM-DD');

export const tripSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1).max(60),
	startDate: isoDate,
	endDate: isoDate,
	purpose: z.enum(PURPOSE_IDS),
	purposeNote: z.string().max(240).default(''),
	currency: z.string().length(3),
	budgetTotal: z.number().nonnegative().nullable(),
	createdAt: z.string(),
	activeDay: z.number().int().nonnegative().default(0),
	budgetInitialized: z.boolean().default(false),
	swipeHintSeen: z.boolean().default(false),
	pendingSuggestionUpdate: z.boolean().default(false)
});

export const itineraryEntrySchema = z.object({
	id: z.string().min(1),
	tripId: z.string().min(1),
	dayIndex: z.number().int().nonnegative().nullable(),
	title: z.string().min(1).max(120),
	time: z
		.string()
		.regex(/^\d{2}:\d{2}$/)
		.nullable(),
	place: z.string().max(160).default(''),
	notes: z.string().max(600).default(''),
	type: z.enum(ENTRY_TYPE_IDS),
	order: z.number().int().nonnegative(),
	createdAt: z.string()
});

export const prepCategorySchema = z.object({
	id: z.string().min(1),
	tripId: z.string().min(1),
	name: z.string().min(1),
	icon: z.string(),
	order: z.number().int().nonnegative()
});

export const prepItemSchema = z.object({
	id: z.string().min(1),
	categoryId: z.string().min(1),
	name: z.string().min(1).max(120),
	quantity: z.number().int().min(1).max(999),
	packed: z.boolean(),
	source: z.enum(['suggested', 'manual']),
	touched: z.boolean(),
	order: z.number().int().nonnegative()
});

export const expenseSchema = z.object({
	id: z.string().min(1),
	tripId: z.string().min(1),
	name: z.string().min(1).max(120),
	category: z.enum(EXPENSE_CATEGORY_IDS),
	unitPrice: z.number().nonnegative().nullable(),
	basis: z.enum(EXPENSE_BASIS_IDS),
	quantity: z.number().int().min(1).max(999),
	quantityEdited: z.boolean()
});

export const tripDraftSchema = z.object({
	step: z.number().int().min(1).max(3),
	name: z.string().max(60),
	startDate: isoDate.nullable(),
	endDate: isoDate.nullable(),
	purpose: z.enum(PURPOSE_IDS),
	purposeNote: z.string().max(240)
});

export const snapshotSchema = z.object({
	version: z.literal(1),
	trip: tripSchema.nullable(),
	entries: z.array(itineraryEntrySchema),
	categories: z.array(prepCategorySchema),
	items: z.array(prepItemSchema),
	expenses: z.array(expenseSchema),
	draft: tripDraftSchema.nullable()
});
