import { describe, expect, it } from 'vitest';
import { formatMoney, formatPercent, formatQuantity, pluralize } from './format';

describe('formatMoney', () => {
	it('uses two decimals for currencies with minor units', () => {
		expect(formatMoney(1234.5, 'USD', 'en-US')).toBe('$1,234.50');
		expect(formatMoney(9, 'EUR', 'en-US')).toBe('€9.00');
	});

	it('keeps zero-decimal currencies whole', () => {
		expect(formatMoney(1234.5, 'JPY', 'en-US')).toBe('¥1,235');
		expect(formatMoney(1000, 'KRW', 'en-US')).toBe('₩1,000');
	});

	it('formats rupiah the way the guide asks for', () => {
		expect(formatMoney(25000, 'IDR')).toBe('Rp25.000');
		expect(formatMoney(1500000, 'IDR')).toBe('Rp1.500.000');
	});

	it('falls back to a readable string for unknown currencies', () => {
		expect(formatMoney(12.5, 'ZZZ', 'en-US')).toContain('12.50');
	});
});

describe('formatPercent', () => {
	it('rounds ratios to whole percentages', () => {
		expect(formatPercent(0)).toBe('0%');
		expect(formatPercent(0.756)).toBe('76%');
		expect(formatPercent(1)).toBe('100%');
	});
});

describe('formatQuantity', () => {
	it('formats whole numbers', () => {
		expect(formatQuantity(2.4)).toBe('2');
		expect(formatQuantity(1000)).toBe('1.000');
	});
});

describe('pluralize', () => {
	it('uses singular for one and plural otherwise', () => {
		expect(pluralize(1, 'item')).toBe('1 item');
		expect(pluralize(0, 'item')).toBe('0 items');
		expect(pluralize(2, 'entry', 'entries')).toBe('2 entries');
	});
});
