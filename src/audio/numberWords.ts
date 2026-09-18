const ONES = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
const TEENS = ['zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
const TENS = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];

/** Deutsches Zahlwort für 0–999 (für Sprachausgabe und Fallback-Anzeige). */
export function numberToGerman(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999) throw new RangeError(`numberToGerman: ${n} liegt außerhalb von 0–999`);
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    if (o === 0) return TENS[t];
    const oneWord = o === 1 ? 'ein' : ONES[o];
    return `${oneWord}und${TENS[t]}`;
  }
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const hundred = `${h === 1 ? 'ein' : ONES[h]}hundert`;
  return rest === 0 ? hundred : `${hundred}${numberToGerman(rest)}`;
}
