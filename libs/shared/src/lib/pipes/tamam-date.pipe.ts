import { Pipe, PipeTransform } from '@angular/core';

export type TamamDateStyle = 'date' | 'datetime' | 'time' | 'short' | 'month';

const OPTIONS: Record<TamamDateStyle, Intl.DateTimeFormatOptions> = {
  date: { day: 'numeric', month: 'long', year: 'numeric' },
  datetime: { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  time: { hour: '2-digit', minute: '2-digit' },
  short: { day: 'numeric', month: 'short' },
  month: { month: 'long', year: 'numeric' },
};

const formatters = new Map<TamamDateStyle, Intl.DateTimeFormat>();

/**
 * Formats API dates in Arabic. The backend sends UTC without a `Z` for some fields,
 * so a date-time string with no offset is treated as UTC. A plain `yyyy-MM-dd` is a calendar date.
 */
@Pipe({ name: 'tamamDate' })
export class TamamDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined, style: TamamDateStyle = 'date'): string {
    if (!value) {
      return '—';
    }

    const date = value instanceof Date ? value : parseApiDate(value);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    let formatter = formatters.get(style);

    if (!formatter) {
      formatter = new Intl.DateTimeFormat('ar-EG-u-nu-latn', OPTIONS[style]);
      formatters.set(style, formatter);
    }

    return formatter.format(date);
  }
}

export function parseApiDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, month - 1, day);
  }

  return new Date(/(Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`);
}
