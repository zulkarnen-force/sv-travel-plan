import { EXPENSE_CATEGORIES, type ExpenseCategoryMeta } from '../config';
import type { Expense, ExpenseBasis, Insight, Tone, Trip } from '../types';
import { daysBetween, nightsBetween } from './date';
import { formatMoney, formatPercent, pluralize } from './format';

export function expenseTotal(expense: Expense): number {
	return (expense.unitPrice ?? 0) * expense.quantity;
}

export function plannedTotal(expenses: Expense[]): number {
	return expenses.reduce((total, expense) => total + expenseTotal(expense), 0);
}

export interface CategoryTotal extends ExpenseCategoryMeta {
	value: number;
	share: number;
}

export function categoryTotals(expenses: Expense[]): CategoryTotal[] {
	const total = plannedTotal(expenses);
	return EXPENSE_CATEGORIES.map((category) => {
		const value = expenses
			.filter((expense) => expense.category === category.id)
			.reduce((sum, expense) => sum + expenseTotal(expense), 0);
		return { ...category, value, share: total > 0 ? value / total : 0 };
	}).filter((category) => category.value > 0);
}

export function largestCategory(expenses: Expense[]): CategoryTotal | null {
	const totals = categoryTotals(expenses).sort((a, b) => b.value - a.value);
	return totals[0] ?? null;
}

export type BudgetStatus = 'none' | 'neutral' | 'warning' | 'critical';

export function budgetStatus(planned: number, budget: number | null): BudgetStatus {
	if (budget === null || budget <= 0) return planned > 0 ? 'critical' : 'none';
	const ratio = planned / budget;
	if (ratio > 1) return 'critical';
	if (ratio >= 0.8) return 'warning';
	return 'neutral';
}

export function budgetRatio(planned: number, budget: number | null): number {
	if (budget === null || budget <= 0) return planned > 0 ? 1 : 0;
	return planned / budget;
}

export function autoQuantity(basis: ExpenseBasis, tripOrDays: Trip | number): number {
	const days =
		typeof tripOrDays === 'number'
			? Math.max(1, tripOrDays)
			: daysBetween(tripOrDays.startDate, tripOrDays.endDate);
	const nights =
		typeof tripOrDays === 'number'
			? Math.max(0, days - 1)
			: nightsBetween(tripOrDays.startDate, tripOrDays.endDate);

	switch (basis) {
		case 'night':
			return Math.max(1, nights);
		case 'day':
			return Math.max(1, days);
		default:
			return 1;
	}
}

export function expenseCalculation(expense: Expense, currency: string): string {
	if (expense.unitPrice === null) return 'Add price';
	const unit = formatMoney(expense.unitPrice, currency);
	if (expense.basis === 'once') {
		return expense.quantity === 1
			? `${unit} one-time`
			: `${unit} × ${expense.quantity} one-time items`;
	}
	const singular = expense.basis === 'night' ? 'night' : expense.basis === 'day' ? 'day' : 'item';
	const label = expense.quantity === 1 ? singular : `${singular}s`;
	return `${unit} × ${expense.quantity} ${label}`;
}

export type RingTone = 'neutral' | 'critical' | 'warning' | 'primary' | 'success';

export function ringTone(packed: number, total: number): RingTone {
	if (total <= 0) return 'neutral';
	const ratio = packed / total;
	if (ratio >= 1) return 'success';
	if (ratio > 2 / 3) return 'primary';
	if (ratio > 1 / 3) return 'warning';
	return 'critical';
}

export function buildInsights(
	trip: Trip,
	expenses: Expense[],
	planned = plannedTotal(expenses),
	days = daysBetween(trip.startDate, trip.endDate)
): Insight[] {
	const currency = trip.currency;
	const money = (value: number) => formatMoney(value, currency);
	const insights: Insight[] = [];
	const missing = expenses.filter((expense) => expense.unitPrice === null).length;
	const biggest = largestCategory(expenses);
	const over = trip.budgetTotal !== null && planned > trip.budgetTotal;

	if (trip.budgetTotal === null) {
		insights.push({
			id: 'no-budget',
			text: 'Set a total budget to see how the plan compares.',
			tone: 'neutral'
		});
	} else if (over && trip.budgetTotal !== null) {
		const overBy = planned - trip.budgetTotal;
		insights.push({
			id: 'over',
			text: `You are ${money(overBy)} over budget.${
				biggest ? ` Largest category: ${biggest.label}.` : ''
			}`,
			tone: 'critical'
		});
	} else if (trip.budgetTotal !== null) {
		insights.push({
			id: 'under',
			text: `${money(trip.budgetTotal - planned)} left to cover extras.`,
			tone: 'success'
		});
	}

	if (missing > 0) {
		insights.push({
			id: 'missing',
			text: `${pluralize(missing, 'expense')} still ${missing === 1 ? 'needs' : 'need'} a price.`,
			tone: 'warning'
		});
	}

	if (biggest && planned > 0 && !over) {
		insights.push({
			id: 'biggest',
			text: `${biggest.label} is your biggest cost at ${formatPercent(
				biggest.value / planned
			)} of the plan.`,
			tone: 'neutral'
		});
	}

	if (planned > 0) {
		insights.push({
			id: 'daily',
			text: `Planned spending averages ${money(planned / Math.max(1, days))} a day.`,
			tone: 'neutral'
		});
	}

	return insights.slice(0, 3);
}

export function insightToneClass(tone: Tone): string {
	switch (tone) {
		case 'critical':
			return 'text-critical';
		case 'warning':
			return 'text-warning';
		case 'success':
			return 'text-success';
		case 'primary':
			return 'text-ink';
		default:
			return 'text-muted';
	}
}
