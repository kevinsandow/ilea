import { ALL_TASKS } from '../data';
import type { Response, Session, Task } from '../types';
import { evaluate, graphemeHitRatio, ratioToBand, scoreTask } from './scoring';

function task(id: string): Task {
  const t = ALL_TASKS.find((x) => x.id === id);
  if (!t) throw new Error(`Task ${id} fehlt`);
  return t;
}

/** Erzeugt Antworten für eine Aufgabe; `wrong` Items werden falsch beantwortet. */
function answers(id: string, opts: { wrong?: number; ms?: number; offByOne?: number; timedOutFrom?: number } = {}): Response[] {
  const t = task(id);
  return t.items.map((item, i) => {
    const timedOut = opts.timedOutFrom !== undefined && i >= opts.timedOutFrom;
    const wrong = i < (opts.wrong ?? 0);
    const maxPoints = item.kind === 'sentence-match' ? 2 : 1;
    return {
      taskId: t.id,
      itemId: item.id,
      given: wrong ? 'x' : 'ok',
      correct: !wrong && !timedOut,
      points: wrong || timedOut ? 0 : maxPoints,
      maxPoints,
      ms: timedOut ? 0 : (opts.ms ?? 1500),
      offByOne: wrong && i < (opts.offByOne ?? 0),
      timedOut,
    };
  });
}

function session(responses: Response[]): Session {
  return { id: 's1', child: 'Test', subjects: ['deutsch', 'mathe'], startedAt: '2026-09-17T08:00:00.000Z', responses };
}

describe('ratioToBand', () => {
  it('teilt in drei Bänder ein', () => {
    expect(ratioToBand(8, 10)).toBe('sicher');
    expect(ratioToBand(6, 10)).toBe('unterwegs');
    expect(ratioToBand(3, 10)).toBe('foerderbedarf');
    expect(ratioToBand(0, 0)).toBe('unterwegs');
  });
});

describe('graphemeHitRatio', () => {
  it('ist 1 bei identischer Schreibung (unabhängig von Groß-/Kleinschreibung)', () => {
    expect(graphemeHitRatio('Lama', 'lama')).toBe(1);
  });
  it('zählt Teiltreffer in richtiger Reihenfolge', () => {
    // "Brifmarke" für "Briefmarke": 9 von 10 Graphemen getroffen
    expect(graphemeHitRatio('Briefmarke', 'Brifmarke')).toBeCloseTo(0.9);
    expect(graphemeHitRatio('Fisch', '')).toBe(0);
  });
});

describe('scoreTask', () => {
  it('summiert Punkte und zählt ±1-Fehler', () => {
    const s = session(answers('ma-zahlzerlegungen', { wrong: 3, offByOne: 2 }));
    const score = scoreTask(task('ma-zahlzerlegungen'), s);
    expect(score.maxPoints).toBe(12);
    expect(score.points).toBe(9);
    expect(score.offByOne).toBe(2);
    expect(score.band).toBe('unterwegs');
  });

  it('bewertet Lesegeschwindigkeit nach bearbeiteten Wörtern pro Minute', () => {
    const fast = scoreTask(task('de-lesegeschwindigkeit'), session(answers('de-lesegeschwindigkeit', { timedOutFrom: 25 })));
    expect(fast.answered).toBe(25);
    expect(fast.timedOut).toBe(7);
    expect(fast.band).toBe('sicher');

    const slow = scoreTask(task('de-lesegeschwindigkeit'), session(answers('de-lesegeschwindigkeit', { timedOutFrom: 8 })));
    expect(slow.band).toBe('foerderbedarf');
  });
});

describe('evaluate – Förderhinweise', () => {
  it('gibt keine Hinweise bei durchgehend richtigen Antworten', () => {
    const rs = ALL_TASKS.flatMap((t) => answers(t.id, { timedOutFrom: t.timeLimitMs ? 28 : undefined }));
    const ev = evaluate(session(rs), ALL_TASKS);
    expect(ev.hints).toEqual([]);
    expect(ev.areas.every((a) => a.band === 'sicher')).toBe(true);
    expect(ev.totals.mathe.points).toBe(ev.totals.mathe.maxPoints);
  });

  it('ZZ: viele Fehler bei Zahlzerlegungen/Plus-Minus', () => {
    const rs = [...answers('ma-zahlzerlegungen', { wrong: 6 }), ...answers('ma-plus-minus')];
    const codes = evaluate(session(rs), ALL_TASKS).hints.map((h) => h.code);
    expect(codes).toContain('ZZ');
  });

  it('ZZ: auch bei richtigen, aber sehr langsamen Antworten', () => {
    const rs = [...answers('ma-zahlzerlegungen', { ms: 9000 }), ...answers('ma-plus-minus', { ms: 9000 })];
    expect(evaluate(session(rs), ALL_TASKS).hints.map((h) => h.code)).toContain('ZZ');
  });

  it('GV: Rechengeschichten überwiegend falsch', () => {
    const rs = answers('ma-rechengeschichten', { wrong: 5 });
    expect(evaluate(session(rs), ALL_TASKS).hints.map((h) => h.code)).toContain('GV');
    const ok = answers('ma-rechengeschichten', { wrong: 2 });
    expect(evaluate(session(ok), ALL_TASKS).hints.map((h) => h.code)).not.toContain('GV');
  });

  it('ZF: gehäufte Fehler um ±1 über alle Mathematikaufgaben', () => {
    const rs = [...answers('ma-zahlzerlegungen', { wrong: 3, offByOne: 3 }), ...answers('ma-plus-minus'), ...answers('ma-rechengeschichten')];
    const hints = evaluate(session(rs), ALL_TASKS).hints;
    expect(hints.map((h) => h.code)).toContain('ZF');
  });

  it('SW: Stellenwert-Aufgaben auffällig', () => {
    const rs = [...answers('ma-zahlauffassung', { wrong: 3 }), ...answers('ma-stellenwerttafel', { wrong: 2 })];
    expect(evaluate(session(rs), ALL_TASKS).hints.map((h) => h.code)).toContain('SW');
  });

  it('LF-W: Lesegeschwindigkeit nicht instruktionsgemäß (< 75 % richtig)', () => {
    const rs = answers('de-lesegeschwindigkeit', { wrong: 12, timedOutFrom: 20 });
    const codes = evaluate(session(rs), ALL_TASKS).hints.map((h) => h.code);
    expect(codes).toContain('LF-W');
    expect(codes).not.toContain('LF');
  });

  it('LF: zu wenige Wörter in der Zeit', () => {
    const rs = answers('de-lesegeschwindigkeit', { timedOutFrom: 6 });
    expect(evaluate(session(rs), ALL_TASKS).hints.map((h) => h.code)).toContain('LF');
  });

  it('LV und RS bei schwachen Ergebnissen', () => {
    const rs = [...answers('de-lueckensaetze', { wrong: 4 }), ...answers('de-saetze-verbinden', { wrong: 2 }), ...answers('de-woerter-schreiben', { wrong: 7 })];
    const codes = evaluate(session(rs), ALL_TASKS).hints.map((h) => h.code);
    expect(codes).toContain('LV');
    expect(codes).toContain('RS');
  });

  it('berücksichtigt nur bearbeitete Aufgaben', () => {
    const ev = evaluate(session(answers('ma-plus-minus')), ALL_TASKS);
    expect(ev.areas).toHaveLength(1);
    expect(ev.areas[0].area.id).toBe('ma-rechenstrategien');
    expect(ev.totals.deutsch.maxPoints).toBe(0);
  });
});
