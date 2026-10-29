import { MoneyPipe } from './money.pipe';

describe('MoneyPipe', () => {
  const pipe = new MoneyPipe();

  it('prints a dash for empty values', () => {
    expect(pipe.transform(null, 'EGP')).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
  });

  it('formats amounts with Latin digits', () => {
    expect(pipe.transform(1500, 'EGP')).toMatch(/1,500\.00/);
  });
});
