import { describe, expect, it } from 'vitest';
import type { Expense, Trip } from '../types';
import {
	autoQuantity,
	budgetRatio,
	budgetStatus,
	buildInsights,
	categoryTotals,
	expenseCalculation,
	expenseTotal,
	largestCategory,
	plannedTotal,
	ringTone
} from './budget';

function expense(overrides: Partial<Expense> = {}): Expense {
	return {
		id: 'expense-1',
		tripId: 'trip-1',
		name: 'Hotel',
		category: 'hotel',
		unitPrice: 100,
		basis: 'night',
		quantity: 3,
		quantityEdited: false,
		...overrides
	};
}

function trip(overrides: Partial<Trip> = {}): Trip {
	return {
		id: 'trip-1',
		name: 'Test trip',
		startDate: '2026-10-30',
		endDate: '2026-11-02',
		purpose: 'general',
		purposeNote: '',
		currency: 'USD',
		budgetTotal: 1000,
		createdAt: '2026-10-01T00:00:00.000Z',
		activeDay: 0,
		budgetInitialized: true,
		swipeHintSeen: false,
		pendingSuggestionUpdate: false,
		...overrides
	};
}

describe('expense totals', () => {
	it('multiplies unit price by quantity', () => {
		expect(expenseTotal(expense())).toBe(300);
		expect(expenseTotal(expense({ unitPrice: null }))).toBe(0);
	});

	it('sums the whole plan', () => {
		expect(
			plannedTotal([expense(), expense({ id: 'expense-2', unitPrice: 50, quantity: 2 })])
		).toBe(400);
	});

	it('groups totals by category and drops empty categories', () => {
		const totals = categoryTotals([
			expense(),
			expense({ id: 'expense-2', category: 'eat', unitPrice: 25, quantity: 4 })
		]);

		expect(totals).toHaveLength(2);
		expect(totals[0]).toMatchObject({ id: 'hotel', value: 300, share: 0.75 });
		expect(totals[1]).toMatchObject({ id: 'eat', value: 100, share: 0.25 });
	});

	it('finds the largest category', () => {
		const largest = largestCategory([
			expense({ category: 'hotel', unitPrice: 100, quantity: 2 }),
			expense({ id: 'expense-2', category: 'eat', unitPrice: 300, quantity: 1 })
		]);

		expect(largest?.id).toBe('eat');
		expect(largest?.value).toBe(300);
	});
});

describe('budget status', () => {
	it('handles missing and zero budgets', () => {
		expect(budgetStatus(0, null)).toBe('none');
		expect(budgetStatus(100, null)).toBe('critical');
		expect(budgetStatus(0, 0)).toBe('none');
		expect(budgetStatus(100, 0)).toBe('critical');
	});

	it('flags near and over budget plans', () => {
		expect(budgetStatus(500, 1000)).toBe('neutral');
		expect(budgetStatus(800, 1000)).toBe('warning');
		expect(budgetStatus(1000, 1000)).toBe('warning');
		expect(budgetStatus(1001, 1000)).toBe('critical');
	});

	it('returns a ratio, falling back to a full bar for unpriced budgets', () => {
		expect(budgetRatio(500, 1000)).toBe(0.5);
		expect(budgetRatio(100, null)).toBe(1);
		expect(budgetRatio(0, null)).toBe(0);
	});
});

describe('autoQuantity', () => {
	it('uses nights, days or a single item depending on basis', () => {
		expect(autoQuantity('night', 4)).toBe(3);
		expect(autoQuantity('day', 4)).toBe(4);
		expect(autoQuantity('item', 4)).toBe(1);
		expect(autoQuantity('once', 4)).toBe(1);
	});

	it('accepts a trip and keeps at least one unit', () => {
		expect(autoQuantity('night', trip())).toBe(3);
		expect(autoQuantity('night', trip({ startDate: '2026-10-30', endDate: '2026-10-30' }))).toBe(1);
	});
});

describe('expenseCalculation', () => {
	it('describes one-time, nightly and per-item costs', () => {
		expect(expenseCalculation(expense({ unitPrice: 120, basis: 'once' }), 'USD')).toContain(
			'sekali'
		);
		expect(
			expenseCalculation(expense({ unitPrice: 100, basis: 'night', quantity: 2 }), 'USD')
		).toContain('× 2 malam');
		expect(
			expenseCalculation(expense({ unitPrice: 10, basis: 'item', quantity: 3 }), 'USD')
		).toContain('× 3 item');
	});

	it('prompts for a missing price', () => {
		expect(expenseCalculation(expense({ unitPrice: null }), 'USD')).toBe('Tambah harga');
	});
});

describe('ringTone', () => {
	it('maps packed progress to thresholds', () => {
		expect(ringTone(0, 0)).toBe('neutral');
		expect(ringTone(0, 10)).toBe('critical');
		expect(ringTone(3, 10)).toBe('critical');
		expect(ringTone(4, 10)).toBe('warning');
		expect(ringTone(6, 10)).toBe('warning');
		expect(ringTone(7, 10)).toBe('primary');
		expect(ringTone(9, 10)).toBe('primary');
		expect(ringTone(10, 10)).toBe('success');
	});
});

describe('buildInsights', () => {
	it('asks for a budget when none is set', () => {
		const insights = buildInsights(trip({ budgetTotal: null }), []);
		expect(insights[0]).toMatchObject({ id: 'no-budget', tone: 'neutral' });
	});

	it('reports remaining budget and the biggest category', () => {
		const expenses = [
			expense({ category: 'hotel', unitPrice: 300, quantity: 1 }),
			expense({ id: 'expense-2', category: 'eat', unitPrice: 100, quantity: 1 })
		];
		const insights = buildInsights(trip(), expenses, plannedTotal(expenses));

		expect(insights[0]).toMatchObject({ id: 'under', tone: 'success' });
		expect(insights[0].text).toContain('600,00');
		expect(insights.some((insight) => insight.id === 'biggest')).toBe(true);
		expect(insights.some((insight) => insight.id === 'daily')).toBe(true);
	});

	it('reports overspending and missing prices, capped at three insights', () => {
		const expenses = [
			expense({ unitPrice: 500, quantity: 1 }),
			expense({ id: 'expense-2', category: 'eat', unitPrice: null, quantity: 1 })
		];
		const insights = buildInsights(trip({ budgetTotal: 100 }), expenses, plannedTotal(expenses));

		expect(insights).toHaveLength(3);
		expect(insights[0]).toMatchObject({ id: 'over', tone: 'critical' });
		expect(insights[1]).toMatchObject({ id: 'missing', tone: 'warning' });
	});
});
