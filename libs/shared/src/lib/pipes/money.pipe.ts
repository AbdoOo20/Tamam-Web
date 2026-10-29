import { Pipe, PipeTransform } from '@angular/core';

const formatters = new Map<string, Intl.NumberFormat>();

function formatterFor(currency: string): Intl.NumberFormat {
  let formatter = formatters.get(currency);

  if (!formatter) {
    try {
      formatter = new Intl.NumberFormat('ar-EG-u-nu-latn', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      });
    } catch {
      formatter = new Intl.NumberFormat('ar-EG-u-nu-latn', { maximumFractionDigits: 2 });
    }

    formatters.set(currency, formatter);
  }

  return formatter;
}

/** `{{ 250 | money: 'EGP' }}` → `‏250.00 ج.م.‏`. Without a currency it prints a plain number. */
@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  transform(value: number | null | undefined, currency?: string | null): string {
    if (value === null || value === undefined) {
      return '—';
    }

    return currency
      ? formatterFor(currency).format(value)
      : new Intl.NumberFormat('ar-EG-u-nu-latn', { maximumFractionDigits: 2 }).format(value);
  }
}
