const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const MS_PER_DAY = 86_400_000;

const pad = (value: number) => String(value).padStart(2, '0');

/** Parses YYYY-MM-DD as a local date at midday, avoiding DST edge cases. */
export function parseDate(iso: string): Date {
	const [year, month, day] = iso.split('-').map(Number);
	return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function toISO(date: Date): string {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO(): string {
	return toISO(new Date());
}

export function isValidISO(value: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const parsed = parseDate(value);
	return toISO(parsed) === value;
}

export function addDays(iso: string, amount: number): string {
	const date = parseDate(iso);
	date.setDate(date.getDate() + amount);
	return toISO(date);
}

function utcValue(iso: string): number {
	const [year, month, day] = iso.split('-').map(Number);
	return Date.UTC(year, month - 1, day);
}

/** Inclusive length: a single-day trip is 1. */
export function daysBetween(startDate: string, endDate: string): number {
	return Math.max(1, Math.round((utcValue(endDate) - utcValue(startDate)) / MS_PER_DAY) + 1);
}

export function nightsBetween(startDate: string, endDate: string): number {
	return Math.max(0, daysBetween(startDate, endDate) - 1);
}

export function tripDayDates(startDate: string, endDate: string): string[] {
	const total = daysBetween(startDate, endDate);
	return Array.from({ length: total }, (_, index) => addDays(startDate, index));
}

export function isPast(iso: string): boolean {
	return iso < todayISO();
}

export function monthLabel(year: number, month: number): string {
	return `${MONTHS[month]} ${year}`;
}

export interface CalendarCell {
	iso: string;
	day: number;
	inMonth: boolean;
}

/** Monday-first month grid with six weeks of cells. */
export function buildMonthGrid(year: number, month: number): CalendarCell[] {
	const first = new Date(year, month, 1, 12);
	const offset = (first.getDay() + 6) % 7;
	const cells: CalendarCell[] = [];

	for (let index = 0; index < 42; index += 1) {
		const date = new Date(year, month, 1 - offset + index, 12);
		cells.push({
			iso: toISO(date),
			day: date.getDate(),
			inMonth: date.getMonth() === month
		});
	}

	return cells;
}

export function shiftMonth(
	year: number,
	month: number,
	delta: number
): { year: number; month: number } {
	const date = new Date(year, month + delta, 1, 12);
	return { year: date.getFullYear(), month: date.getMonth() };
}

export function formatRange(startDate: string, endDate: string): string {
	const start = parseDate(startDate);
	const end = parseDate(endDate);
	const sameYear = start.getFullYear() === end.getFullYear();
	const sameMonth = sameYear && start.getMonth() === end.getMonth();
	const startMonth = MONTHS[start.getMonth()];
	const endMonth = MONTHS[end.getMonth()];

	if (startDate === endDate) {
		return `${start.getDate()} ${startMonth}${sameYear ? '' : ` ${start.getFullYear()}`}`;
	}

	if (sameMonth) {
		return `${start.getDate()}–${end.getDate()} ${endMonth}`;
	}

	if (sameYear) {
		return `${start.getDate()} ${startMonth} – ${end.getDate()} ${endMonth}`;
	}

	return `${start.getDate()} ${startMonth} ${start.getFullYear()} – ${end.getDate()} ${endMonth} ${end.getFullYear()}`;
}

export function formatDayChip(iso: string): string {
	const date = parseDate(iso);
	return `${WEEKDAYS[date.getDay()]} ${date.getDate()}`;
}

export function formatDayHeading(iso: string): string {
	const date = parseDate(iso);
	return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function formatLongDate(iso: string): string {
	const date = parseDate(iso);
	return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatLength(days: number): string {
	const nights = Math.max(0, days - 1);
	if (days === 1) return '1 hari';
	return `${days} hari, ${nights} malam`;
}

export function weekdayShort(iso: string): string {
	return WEEKDAYS[parseDate(iso).getDay()];
}
