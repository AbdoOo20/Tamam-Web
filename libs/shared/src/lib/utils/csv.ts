/** Reads CSV text into rows. Handles quoted cells, commas inside quotes and a UTF-8 BOM. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const source = text.replace(/^﻿/, '');

  for (let index = 0; index < source.length; index++) {
    const char = source[index];

    if (quoted) {
      if (char === '"' && source[index + 1] === '"') {
        cell += '"';
        index++;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell.trim());
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[index + 1] === '\n') {
        index++;
      }

      row.push(cell.trim());
      cell = '';

      if (row.some((value) => value !== '')) {
        rows.push(row);
      }

      row = [];
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());

  if (row.some((value) => value !== '')) {
    rows.push(row);
  }

  return rows;
}
