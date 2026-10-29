import { ZERO_DECIMAL_CURRENCIES } from '../config';

/** Formats money with the browser's locale. Currencies without minor units stay whole. */
export function formatMoney(amount: number, currency: string, locale?: string): string {
	const code = currency.toUpperCase();
	const zeroDecimal = ZERO_DECIMAL_CURRENCIES.has(code);

	try {
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: code,
			minimumFractionDigits: zeroDecimal ? 0 : 2,
			maximumFractionDigits: zeroDecimal ? 0 : 2
		}).format(amount);
	} catch {
		return `${code} ${amount.toFixed(zeroDecimal ? 0 : 2)}`;
	}
}

export function formatPercent(ratio: number): string {
	return `${Math.round(ratio * 100)}%`;
}

export function formatQuantity(value: number): string {
	return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
	return `${count} ${count === 1 ? singular : plural}`;
}
