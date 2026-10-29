import { parseCsv } from './csv';

describe('parseCsv', () => {
  it('splits rows and cells', () => {
    expect(parseCsv('a,b\n1,2')).toEqual([['a', 'b'], ['1', '2']]);
  });

  it('keeps commas and escaped quotes inside quoted cells', () => {
    expect(parseCsv('"a, b","say ""hi"""')).toEqual([['a, b', 'say "hi"']]);
  });

  it('skips blank lines, handles CRLF and a BOM', () => {
    expect(parseCsv('﻿x,y\r\n\r\n1,2\r\n')).toEqual([['x', 'y'], ['1', '2']]);
  });
});
