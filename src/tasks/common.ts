import type { ItemResult } from '../types';

/** Bewertet eine Zahleingabe; markiert Fehler um ±1 (zählendes Rechnen). */
export function numericResult(given: string, answer: number): ItemResult {
  const n = given.trim() === '' ? NaN : Number(given);
  const correct = n === answer;
  return {
    given: given.trim(),
    correct,
    points: correct ? 1 : 0,
    maxPoints: 1,
    offByOne: !correct && Number.isFinite(n) && Math.abs(n - answer) === 1,
  };
}

export function choiceResult(given: string, correct: boolean): ItemResult {
  return { given, correct, points: correct ? 1 : 0, maxPoints: 1 };
}

export function unknownResult(maxPoints = 1): ItemResult {
  return { given: '?', correct: false, points: 0, maxPoints, unknown: true };
}

export function relationOf(a: number, b: number): '<' | '=' | '>' {
  return a < b ? '<' : a > b ? '>' : '=';
}
