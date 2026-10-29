import { describe, expect, it } from 'vitest';
import {
	addDays,
	buildMonthGrid,
	daysBetween,
	formatDayChip,
	formatDayHeading,
	formatLength,
	formatLongDate,
	formatRange,
	isValidISO,
	nightsBetween,
	shiftMonth,
	tripDayDates
} from './date';

describe('daysBetween', () => {
	it('counts inclusively', () => {
		expect(daysBetween('2026-10-30', '2026-10-30')).toBe(1);
		expect(daysBetween('2026-10-30', '2026-11-02')).toBe(4);
	});

	it('does not lose a day across a daylight-saving change', () => {
		expect(daysBetween('2026-03-28', '2026-03-30')).toBe(3);
		expect(daysBetween('2026-10-24', '2026-10-26')).toBe(3);
	});

	it('never returns less than one day', () => {
		expect(daysBetween('2026-10-30', '2026-10-29')).toBe(1);
	});
});

describe('nightsBetween', () => {
	it('is one less than the inclusive day count', () => {
		expect(nightsBetween('2026-10-30', '2026-10-30')).toBe(0);
		expect(nightsBetween('2026-10-30', '2026-11-02')).toBe(3);
	});
});

describe('date helpers', () => {
	it('adds days without drifting across months or years', () => {
		expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
		expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
	});

	it('builds an inclusive list of trip dates', () => {
		expect(tripDayDates('2026-10-30', '2026-11-01')).toEqual([
			'2026-10-30',
			'2026-10-31',
			'2026-11-01'
		]);
	});

	it('validates real ISO calendar dates', () => {
		expect(isValidISO('2026-10-30')).toBe(true);
		expect(isValidISO('2026-02-29')).toBe(false);
		expect(isValidISO('2024-02-29')).toBe(true);
		expect(isValidISO('30-10-2026')).toBe(false);
		expect(isValidISO('2026-13-01')).toBe(false);
	});
});

describe('buildMonthGrid', () => {
	it('starts on Monday and returns six weeks', () => {
		const cells = buildMonthGrid(2026, 9);

		expect(cells).toHaveLength(42);
		expect(cells[0].iso).toBe('2026-09-28');
		expect(cells[41].iso).toBe('2026-11-08');
		expect(cells.filter((cell) => cell.inMonth)).toHaveLength(31);
	});

	it('shifts months across year boundaries', () => {
		expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
		expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
	});
});

describe('formatting', () => {
	it('formats ranges compactly', () => {
		expect(formatRange('2026-10-30', '2026-10-30')).toBe('30 Okt');
		expect(formatRange('2026-10-05', '2026-10-09')).toBe('5–9 Okt');
		expect(formatRange('2026-10-30', '2026-11-02')).toBe('30 Okt – 2 Nov');
		expect(formatRange('2026-12-28', '2027-01-03')).toBe('28 Des 2026 – 3 Jan 2027');
	});

	it('formats day labels', () => {
		expect(formatDayChip('2026-10-30')).toBe('Jum 30');
		expect(formatDayHeading('2026-10-30')).toBe('Jum 30 Okt');
		expect(formatLongDate('2026-10-30')).toBe('30 Okt 2026');
	});

	it('formats trip length in days and nights', () => {
		expect(formatLength(1)).toBe('1 hari');
		expect(formatLength(2)).toBe('2 hari, 1 malam');
		expect(formatLength(4)).toBe('4 hari, 3 malam');
	});
});
