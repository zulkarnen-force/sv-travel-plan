import { describe, expect, it } from 'vitest';
import { buildSuggestions, purposeLabel } from './config';

function quantityOf(suggestions: ReturnType<typeof buildSuggestions>, name: string): number {
	return suggestions.find((suggestion) => suggestion.name === name)?.quantity ?? 0;
}

describe('buildSuggestions', () => {
	it('caps clothing quantities for longer trips', () => {
		const suggestions = buildSuggestions(14, 'general');

		expect(quantityOf(suggestions, 'Underwear')).toBe(7);
		expect(quantityOf(suggestions, 'Socks')).toBe(7);
		expect(quantityOf(suggestions, 'T-shirts or tops')).toBe(7);
		expect(quantityOf(suggestions, 'Bottoms (pants, shorts, skirt)')).toBe(5);
		expect(quantityOf(suggestions, 'Sleepwear')).toBe(2);
	});

	it('scales bottoms and sleepwear for short trips', () => {
		const suggestions = buildSuggestions(3, 'general');

		expect(quantityOf(suggestions, 'Bottoms (pants, shorts, skirt)')).toBe(2);
		expect(quantityOf(suggestions, 'Sleepwear')).toBe(1);
	});

	it('adds purpose-specific items', () => {
		const suggestions = buildSuggestions(5, 'beach');

		expect(quantityOf(suggestions, 'Swimwear')).toBe(2);
		expect(quantityOf(suggestions, 'Beach cover-up')).toBe(1);
		expect(quantityOf(suggestions, 'Sandals')).toBe(1);
		expect(quantityOf(suggestions, 'Hat')).toBe(1);
	});

	it('replaces and boosts items for hiking and family trips', () => {
		const hiking = buildSuggestions(4, 'hiking');
		expect(hiking.some((suggestion) => suggestion.name === 'T-shirts or tops')).toBe(false);
		expect(quantityOf(hiking, 'Quick-dry tops')).toBe(4);
		expect(quantityOf(hiking, 'Extra socks')).toBe(2);

		const family = buildSuggestions(4, 'family');
		expect(quantityOf(family, 'T-shirts or tops')).toBe(6);
	});

	it('normalizes invalid day counts to at least one day', () => {
		const suggestions = buildSuggestions(0, 'general');

		expect(quantityOf(suggestions, 'Underwear')).toBe(1);
		expect(quantityOf(suggestions, 'Bottoms (pants, shorts, skirt)')).toBe(2);
	});
});

describe('purposeLabel', () => {
	it('returns a readable label for each purpose', () => {
		expect(purposeLabel('hiking')).toBe('Hiking & outdoors');
		expect(purposeLabel('city')).toBe('City break');
	});
});
