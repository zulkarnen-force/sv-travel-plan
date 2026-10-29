import { ZERO_DECIMAL_CURRENCIES } from '../config';

/** Formats money for an Indonesian audience. Currencies without minor units stay whole. */
export function formatMoney(amount: number, currency: string, locale = 'id-ID'): string {
	const code = currency.toUpperCase();
	const zeroDecimal = ZERO_DECIMAL_CURRENCIES.has(code);

	try {
		const formatted = new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: code,
			minimumFractionDigits: zeroDecimal ? 0 : 2,
			maximumFractionDigits: zeroDecimal ? 0 : 2
		}).format(amount);
		// "Rp 25.000" is correct for the formatter, but the guide wants "Rp25.000".
		return formatted.replace(/\u00a0/g, '').replace(/^Rp\s+/, 'Rp');
	} catch {
		return `${code} ${amount.toFixed(zeroDecimal ? 0 : 2)}`;
	}
}

export function formatPercent(ratio: number): string {
	return `${Math.round(ratio * 100)}%`;
}

export function formatQuantity(value: number): string {
	return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value);
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
	return `${count} ${count === 1 ? singular : plural}`;
}
