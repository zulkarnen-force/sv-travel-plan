import { describe, expect, it } from 'vitest';
import { buildSuggestions, purposeLabel } from './config';

function quantityOf(suggestions: ReturnType<typeof buildSuggestions>, name: string): number {
	return suggestions.find((suggestion) => suggestion.name === name)?.quantity ?? 0;
}

describe('buildSuggestions', () => {
	it('caps clothing quantities for longer trips', () => {
		const suggestions = buildSuggestions(14, 'general');

		expect(quantityOf(suggestions, 'Celana dalam')).toBe(7);
		expect(quantityOf(suggestions, 'Kaus kaki')).toBe(7);
		expect(quantityOf(suggestions, 'Kaos atau atasan')).toBe(7);
		expect(quantityOf(suggestions, 'Bawahan (celana, celana pendek, rok)')).toBe(5);
		expect(quantityOf(suggestions, 'Baju tidur')).toBe(2);
	});

	it('scales bottoms and sleepwear for short trips', () => {
		const suggestions = buildSuggestions(3, 'general');

		expect(quantityOf(suggestions, 'Bawahan (celana, celana pendek, rok)')).toBe(2);
		expect(quantityOf(suggestions, 'Baju tidur')).toBe(1);
	});

	it('adds purpose-specific items', () => {
		const suggestions = buildSuggestions(5, 'beach');

		expect(quantityOf(suggestions, 'Baju renang')).toBe(2);
		expect(quantityOf(suggestions, 'Baju pantai')).toBe(1);
		expect(quantityOf(suggestions, 'Sandal')).toBe(1);
		expect(quantityOf(suggestions, 'Topi')).toBe(1);
	});

	it('replaces and boosts items for hiking and family trips', () => {
		const hiking = buildSuggestions(4, 'hiking');
		expect(hiking.some((suggestion) => suggestion.name === 'Kaos atau atasan')).toBe(false);
		expect(quantityOf(hiking, 'Kaos cepat kering')).toBe(4);
		expect(quantityOf(hiking, 'Kaus kaki ekstra')).toBe(2);

		const family = buildSuggestions(4, 'family');
		expect(quantityOf(family, 'Kaos atau atasan')).toBe(6);
	});

	it('normalizes invalid day counts to at least one day', () => {
		const suggestions = buildSuggestions(0, 'general');

		expect(quantityOf(suggestions, 'Celana dalam')).toBe(1);
		expect(quantityOf(suggestions, 'Bawahan (celana, celana pendek, rok)')).toBe(2);
	});
});

describe('purposeLabel', () => {
	it('returns a readable label for each purpose', () => {
		expect(purposeLabel('hiking')).toBe('Naik gunung');
		expect(purposeLabel('city')).toBe('Jalan-jalan kota');
	});
});
