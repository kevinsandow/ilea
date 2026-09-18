import { numericResult, relationOf } from './common';
import { spellResult } from './SpellWord';
import { scoreMatches } from './SentenceMatch';

describe('numericResult', () => {
  it('erkennt richtige Antworten', () => {
    expect(numericResult('7', 7)).toMatchObject({ correct: true, points: 1, offByOne: false });
  });
  it('markiert Fehler um ±1 als Zählfehler', () => {
    expect(numericResult('8', 7)).toMatchObject({ correct: false, points: 0, offByOne: true });
    expect(numericResult('6', 7).offByOne).toBe(true);
    expect(numericResult('9', 7).offByOne).toBe(false);
  });
  it('behandelt leere Eingaben als falsch', () => {
    expect(numericResult('', 7)).toMatchObject({ correct: false, offByOne: false, given: '' });
  });
});

describe('spellResult (Rechtschreiben B1)', () => {
  it('ignoriert Groß-/Kleinschreibung', () => {
    expect(spellResult('Lama', 'lama').correct).toBe(true);
    expect(spellResult('Lama', ' Lama ').correct).toBe(true);
  });
  it('wertet Abweichungen als falsch', () => {
    expect(spellResult('Schnecke', 'Schneke')).toMatchObject({ correct: false, points: 0, given: 'Schneke' });
  });
});

describe('scoreMatches (Sätze vervollständigen)', () => {
  const pairs = [
    { start: 'A', end: 'a' },
    { start: 'B', end: 'b' },
    { start: 'C', end: 'c' },
  ];
  it('2 Punkte bei vollständig richtiger Zuordnung', () => {
    expect(scoreMatches(pairs, { A: 'a', B: 'b', C: 'c' })).toBe(2);
  });
  it('1 Punkt bei einer richtigen Zuordnung (zwei vertauscht)', () => {
    expect(scoreMatches(pairs, { A: 'a', B: 'c', C: 'b' })).toBe(1);
  });
  it('0 Punkte ohne richtige Zuordnung', () => {
    expect(scoreMatches(pairs, { A: 'b', B: 'c', C: 'a' })).toBe(0);
  });
});

describe('relationOf', () => {
  it('liefert das Vergleichszeichen', () => {
    expect(relationOf(3, 5)).toBe('<');
    expect(relationOf(5, 5)).toBe('=');
    expect(relationOf(7, 5)).toBe('>');
  });
});
