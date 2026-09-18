import { numberToGerman } from './numberWords';

describe('numberToGerman', () => {
  it.each([
    [0, 'null'],
    [1, 'eins'],
    [7, 'sieben'],
    [10, 'zehn'],
    [11, 'elf'],
    [16, 'sechzehn'],
    [17, 'siebzehn'],
    [20, 'zwanzig'],
    [21, 'einundzwanzig'],
    [30, 'dreißig'],
    [45, 'fünfundvierzig'],
    [63, 'dreiundsechzig'],
    [99, 'neunundneunzig'],
    [100, 'einhundert'],
    [101, 'einhunderteins'],
    [247, 'zweihundertsiebenundvierzig'],
  ])('%i → %s', (n, word) => {
    expect(numberToGerman(n)).toBe(word);
  });

  it('lehnt Zahlen außerhalb von 0–999 ab', () => {
    expect(() => numberToGerman(-1)).toThrow(RangeError);
    expect(() => numberToGerman(1000)).toThrow(RangeError);
    expect(() => numberToGerman(1.5)).toThrow(RangeError);
  });
});
