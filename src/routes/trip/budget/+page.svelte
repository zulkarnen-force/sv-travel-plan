<script lang="ts">
	import { AlertTriangle, CheckCircle2, Info, Pencil, Wallet, X } from '@lucide/svelte';
	import { CURRENCIES, EXPENSE_CATEGORIES, expenseCategoryLabel } from '#lib/config';
	import { app } from '#lib/state.svelte';
	import type { ExpenseInput } from '#lib/state.svelte';
	import { toast } from '#lib/toast.svelte';
	import type { Expense, ExpenseCategoryId } from '#lib/types';
	import {
		buildInsights,
		categoryTotals,
		expenseCalculation,
		expenseTotal,
		insightToneClass,
		plannedTotal
	} from '#lib/utils/budget';
	import { daysBetween } from '#lib/utils/date';
	import { formatMoney, formatPercent } from '#lib/utils/format';
	import BudgetBar from '#lib/components/BudgetBar.svelte';
	import Donut from '#lib/components/Donut.svelte';
	import ExpenseDrawer from '#lib/components/ExpenseDrawer.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import Drawer from '#lib/components/ui/Drawer.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import Label from '#lib/components/ui/Label.svelte';

	const trip = $derived(app.trip);
	const expenses = $derived(app.expenses);
	const planned = $derived(plannedTotal(expenses));
	const days = $derived(trip ? daysBetween(trip.startDate, trip.endDate) : 0);
	const budget = $derived(trip?.budgetTotal ?? null);
	const remaining = $derived(budget !== null ? budget - planned : null);
	const insights = $derived(trip ? buildInsights(trip, expenses, planned, days) : []);
	const totals = $derived(categoryTotals(expenses));
	const missing = $derived(expenses.filter((expense) => expense.unitPrice === null).length);

	let filter = $state<ExpenseCategoryId | null>(null);
	let budgetOpen = $state(false);
	let budgetInput = $state('');
	let expenseOpen = $state(false);
	let editingExpense = $state<Expense | null>(null);

	const groups = $derived(
		EXPENSE_CATEGORIES.map((category) => {
			const list = expenses.filter(
				(expense) => expense.category === category.id && (filter === null || filter === category.id)
			);
			return {
				...category,
				expenses: list,
				total: list.reduce((sum, expense) => sum + expenseTotal(expense), 0)
			};
		}).filter((group) => group.expenses.length > 0)
	);

	const filterLabel = $derived(filter ? expenseCategoryLabel(filter) : '');
	const budgetValid = $derived(
		budgetInput.trim() === '' ||
			(Number.isFinite(Number(budgetInput.trim().replace(',', '.'))) &&
				Number(budgetInput.trim().replace(',', '.')) >= 0)
	);

	$effect(() => {
		if (app.ready && app.trip && !app.trip.budgetInitialized) {
			app.initBudget();
		}
	});

	function toggleFilter(id: string | null) {
		if (!id) {
			filter = null;
			return;
		}
		filter = filter === id ? null : (id as ExpenseCategoryId);
	}

	function iconFor(tone: string) {
		if (tone === 'critical' || tone === 'warning') return AlertTriangle;
		if (tone === 'success') return CheckCircle2;
		return Info;
	}

	function openBudgetEditor() {
		budgetInput = budget !== null ? String(budget) : '';
		budgetOpen = true;
	}

	function saveBudget() {
		if (!budgetValid) return;
		const trimmed = budgetInput.trim();
		const value = trimmed === '' ? null : Number(trimmed.replace(',', '.'));
		app.setBudgetTotal(value);
		budgetOpen = false;
		toast.show(value === null ? 'Budget cleared.' : 'Budget updated.');
	}

	function clearBudget() {
		app.setBudgetTotal(null);
		budgetOpen = false;
		toast.show('Budget cleared.');
	}

	function openAddExpense() {
		editingExpense = null;
		expenseOpen = true;
	}

	function openEditExpense(expense: Expense) {
		editingExpense = expense;
		expenseOpen = true;
	}

	function saveExpense(input: ExpenseInput) {
		if (editingExpense) {
			app.updateExpense(editingExpense.id, input);
			toast.show('Expense updated.');
		} else {
			app.addExpense(input);
		}
		setTimeout(() => {
			editingExpense = null;
		}, 320);
	}

	function deleteExpense(expense: Expense) {
		const removed = app.deleteExpense(expense.id);
		if (removed) {
			toast.show('Expense deleted.', { label: 'Undo', run: () => app.restoreExpense(removed) });
		}
		if (editingExpense?.id === expense.id) {
			setTimeout(() => {
				editingExpense = null;
			}, 320);
		}
	}

	function addStarters() {
		const added = app.addStarterRows();
		toast.show(added > 0 ? `${added} starter rows added.` : 'Starter rows are already there.');
	}
</script>

{#if trip}
	<div class="space-y-4 px-4 pt-4 pb-8">
		<header class="flex items-start justify-between gap-3">
			<div>
				<p class="eyebrow">Budget</p>
				<h1 class="mt-1 text-[28px] leading-tight font-medium tracking-[-0.03em] text-ink">
					Will it fit?
				</h1>
			</div>
			<label class="shrink-0">
				<span class="sr-only">Currency</span>
				<select
					class="min-h-11 rounded-full border border-line bg-card px-3 text-xs font-medium text-ink focus:border-ink focus:ring-2 focus:ring-lime/60 focus:outline-none"
					value={trip.currency}
					onchange={(event) => app.setCurrency(event.currentTarget.value)}
				>
					{#each CURRENCIES as currency (currency)}
						<option value={currency}>{currency}</option>
					{/each}
				</select>
			</label>
		</header>

		<Card variant="surface" padding="lg">
			<div class="flex items-start justify-between gap-3">
				<button
					type="button"
					class="text-left focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
					onclick={openBudgetEditor}
				>
					<span class="eyebrow">Total budget</span>
					<span
						class="mt-1 flex items-center gap-2 text-[28px] leading-none font-medium tracking-[-0.03em] text-ink"
					>
						{budget !== null ? formatMoney(budget, trip.currency) : 'Set a budget'}
						<Pencil size={15} strokeWidth={1.75} class="text-muted" />
					</span>
				</button>
				{#if missing > 0}
					<Badge variant="warning">{missing} need price</Badge>
				{/if}
			</div>

			<div class="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3">
				<div>
					<p class="eyebrow">Planned</p>
					<p class="mt-1 text-lg font-medium text-ink tabular-nums">
						{formatMoney(planned, trip.currency)}
					</p>
				</div>
				<div>
					<p class="eyebrow">
						{remaining !== null && remaining < 0 ? 'Over by' : 'Remaining'}
					</p>
					<p
						class={remaining !== null && remaining < 0
							? 'mt-1 text-lg font-medium text-critical tabular-nums'
							: 'mt-1 text-lg font-medium text-ink tabular-nums'}
					>
						{remaining !== null ? formatMoney(Math.abs(remaining), trip.currency) : '—'}
					</p>
				</div>
			</div>

			<div class="mt-4">
				<BudgetBar {planned} {budget} currency={trip.currency} />
			</div>
		</Card>

		{#if insights.length > 0}
			<div class="space-y-2" aria-live="polite">
				{#each insights as insight (insight.id)}
					{@const Icon = iconFor(insight.tone)}
					<div class="flex items-start gap-2 rounded-[18px] bg-surface px-3.5 py-2.5">
						<Icon
							size={16}
							strokeWidth={1.75}
							class="mt-0.5 shrink-0 {insightToneClass(insight.tone)}"
						/>
						<p class="text-xs leading-relaxed text-ink">{insight.text}</p>
					</div>
				{/each}
			</div>
		{/if}

		{#if planned > 0}
			<Card variant="surface" padding="lg">
				<div class="flex items-center justify-between gap-3">
					<p class="eyebrow">By category</p>
					{#if filter}
						<button
							type="button"
							class="min-h-11 rounded-full px-3 text-xs font-medium text-ink underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
							onclick={() => (filter = null)}
						>
							Clear filter
						</button>
					{/if}
				</div>

				<div class="mt-4">
					<Donut
						slices={totals}
						total={planned}
						currency={trip.currency}
						selectedId={filter}
						onselect={toggleFilter}
					/>
				</div>

				<ul class="mt-4 space-y-1">
					{#each totals as slice (slice.id)}
						<li>
							<button
								type="button"
								class="flex min-h-11 w-full items-center gap-2 rounded-full px-2 text-left transition hover:bg-card focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
								aria-pressed={filter === slice.id}
								onclick={() => toggleFilter(slice.id)}
							>
								<span
									class="h-2.5 w-2.5 shrink-0 rounded-full"
									style:background={slice.color}
									aria-hidden="true"
								></span>
								<span class="min-w-0 flex-1 truncate text-sm text-ink">{slice.label}</span>
								<span class="text-xs text-muted tabular-nums">{formatPercent(slice.share)}</span>
								<span class="text-sm font-medium text-ink tabular-nums">
									{formatMoney(slice.value, trip.currency)}
								</span>
							</button>
						</li>
					{/each}
				</ul>
			</Card>
		{:else}
			<Card variant="surface" padding="lg">
				<p class="eyebrow">By category</p>
				<p class="mt-2 text-sm leading-relaxed text-muted">
					Add prices to see the split. Unpriced rows still count as zero.
				</p>
			</Card>
		{/if}

		<section class="space-y-3">
			<div class="flex items-center justify-between gap-3">
				<h2 class="text-[20px] font-medium tracking-[-0.02em] text-ink">Expenses</h2>
				{#if filter}
					<Badge variant="surface">
						{filterLabel}
						<button
							type="button"
							class="-my-2 -mr-1 grid h-11 w-11 place-items-center rounded-full hover:bg-line/50 focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
							aria-label="Clear category filter"
							onclick={() => (filter = null)}
						>
							<X size={12} strokeWidth={2.5} />
						</button>
					</Badge>
				{/if}
			</div>

			{#if expenses.length === 0}
				<Card variant="surface" padding="lg" class="text-center">
					<span class="mx-auto grid h-11 w-11 place-items-center rounded-full bg-card text-ink">
						<Wallet size={20} strokeWidth={1.75} />
					</span>
					<p class="mt-3 text-sm font-medium text-ink">No expenses yet.</p>
					<p class="mt-1 text-xs leading-relaxed text-muted">
						Start with Hotel, Eat and drink, and Laundry. Add prices as you know them.
					</p>
					<div class="mt-3 flex flex-col gap-2">
						<Button variant="secondary" fullWidth onclick={addStarters}>Add starter rows</Button>
						<Button fullWidth onclick={openAddExpense}>Add expense</Button>
					</div>
				</Card>
			{:else if groups.length === 0}
				<Card variant="surface" padding="lg" class="text-center">
					<p class="text-sm text-muted">No expenses in {filterLabel}.</p>
					<button
						type="button"
						class="mt-2 min-h-11 text-sm font-medium text-ink underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
						onclick={() => (filter = null)}
					>
						Show all expenses
					</button>
				</Card>
			{:else}
				{#each groups as group (group.id)}
					<div>
						<div class="flex items-center justify-between gap-3 px-1">
							<h3 class="eyebrow">{group.label}</h3>
							<span class="text-xs text-muted tabular-nums">
								{formatMoney(group.total, trip.currency)}
							</span>
						</div>
						<Card variant="surface" padding="none" class="mt-1">
							<div class="divide-y divide-line/70">
								{#each group.expenses as expense (expense.id)}
									<button
										type="button"
										class="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-line/30 focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
										onclick={() => openEditExpense(expense)}
									>
										<span
											class="h-2.5 w-2.5 shrink-0 rounded-full"
											style:background={group.color}
											aria-hidden="true"
										></span>
										<span class="min-w-0 flex-1">
											<span class="block truncate text-sm font-medium text-ink">{expense.name}</span
											>
											<span class="mt-0.5 block text-[11px] text-muted">
												{expenseCalculation(expense, trip.currency)}
											</span>
										</span>
										<span
											class={expense.unitPrice === null
												? 'shrink-0 text-sm font-medium text-muted tabular-nums'
												: 'shrink-0 text-sm font-medium text-ink tabular-nums'}
										>
											{expense.unitPrice === null
												? '—'
												: formatMoney(expenseTotal(expense), trip.currency)}
										</span>
									</button>
								{/each}
							</div>
						</Card>
					</div>
				{/each}
			{/if}
		</section>

		<div
			class="sticky bottom-0 -mx-4 mt-6 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur"
		>
			<Button fullWidth size="lg" onclick={openAddExpense}>Add expense</Button>
		</div>
	</div>

	<Drawer
		bind:open={budgetOpen}
		title="Total budget"
		description="A rough number is fine. Planned spending is compared with this amount."
	>
		{#snippet footer()}
			<div class="space-y-1">
				<Button type="submit" form="budget-form" fullWidth size="lg" disabled={!budgetValid}>
					Save budget
				</Button>
				{#if budget !== null}
					<Button variant="ghost" fullWidth onclick={clearBudget}>Clear budget</Button>
				{/if}
			</div>
		{/snippet}

		<form
			id="budget-form"
			onsubmit={(event) => {
				event.preventDefault();
				saveBudget();
			}}
		>
			<Label for="budget-amount">Budget ({trip.currency})</Label>
			<Input
				id="budget-amount"
				bind:value={budgetInput}
				inputmode="decimal"
				placeholder="0"
				autofocus
				class="mt-2"
				aria-invalid={!budgetValid}
				aria-describedby={!budgetValid ? 'budget-error budget-help' : 'budget-help'}
			/>
			{#if !budgetValid}
				<p id="budget-error" class="mt-1 text-xs text-critical">Enter a number of 0 or more.</p>
			{/if}
			<p id="budget-help" class="mt-2 text-xs leading-relaxed text-muted">
				Leave it empty to clear the budget. Nothing is converted between currencies.
			</p>
		</form>
	</Drawer>

	<ExpenseDrawer
		bind:open={expenseOpen}
		expense={editingExpense}
		{trip}
		onsave={saveExpense}
		ondelete={deleteExpense}
	/>
{/if}
