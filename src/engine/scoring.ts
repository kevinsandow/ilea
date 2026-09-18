import { AREAS } from '../data/areas';
import type { Area, AreaId, Response, Session, Subject, Task } from '../types';

/**
 * Auswertung einer Sitzung: Punkte je Aufgabe und Kompetenzbereich sowie
 * Förderhinweise nach den (vereinfachten) Regeln des ILeA-plus-Handbuchs.
 */

export type Band = 'sicher' | 'unterwegs' | 'foerderbedarf';

export const BAND_LABEL: Record<Band, string> = {
  sicher: 'weit entwickelt',
  unterwegs: 'auf dem Weg',
  foerderbedarf: 'Förderhinweis',
};

export interface TaskScore {
  task: Task;
  points: number;
  maxPoints: number;
  answered: number;
  correct: number;
  offByOne: number;
  unknown: number;
  timedOut: number;
  avgMs: number;
  band: Band;
}

export interface AreaScore {
  area: Area;
  points: number;
  maxPoints: number;
  band: Band;
  tasks: TaskScore[];
}

export interface Hint {
  code: string;
  subject: Subject;
  title: string;
  reason: string;
  suggestion: string;
}

export interface Evaluation {
  areas: AreaScore[];
  hints: Hint[];
  totals: Record<Subject, { points: number; maxPoints: number }>;
}

export function ratioToBand(points: number, max: number): Band {
  if (max === 0) return 'unterwegs';
  const r = points / max;
  if (r >= 0.8) return 'sicher';
  if (r >= 0.55) return 'unterwegs';
  return 'foerderbedarf';
}

function responsesFor(session: Session, taskId: string): Response[] {
  return session.responses.filter((r) => r.taskId === taskId);
}

export function scoreTask(task: Task, session: Session): TaskScore {
  const rs = responsesFor(session, task.id);
  const answered = rs.filter((r) => !r.timedOut);
  const points = rs.reduce((s, r) => s + r.points, 0);
  const maxPoints = rs.reduce((s, r) => s + r.maxPoints, 0);
  const avgMs = answered.length ? answered.reduce((s, r) => s + r.ms, 0) / answered.length : 0;

  let band: Band;
  if (task.timeLimitMs) {
    // Lesegeschwindigkeit: Messwert ist die Anzahl bearbeiteter Wörter, nicht die Punkte.
    const perMinute = (answered.length / task.timeLimitMs) * 60_000;
    band = perMinute >= 20 ? 'sicher' : perMinute >= 12 ? 'unterwegs' : 'foerderbedarf';
  } else {
    band = ratioToBand(points, maxPoints);
  }

  return {
    task,
    points,
    maxPoints,
    answered: answered.length,
    correct: rs.filter((r) => r.correct).length,
    offByOne: rs.filter((r) => r.offByOne).length,
    unknown: rs.filter((r) => r.unknown).length,
    timedOut: rs.filter((r) => r.timedOut).length,
    avgMs,
    band,
  };
}

function scoreAreas(tasks: Task[], session: Session): AreaScore[] {
  const byArea = new Map<AreaId, TaskScore[]>();
  for (const task of tasks) {
    if (!session.responses.some((r) => r.taskId === task.id)) continue;
    const list = byArea.get(task.area) ?? [];
    list.push(scoreTask(task, session));
    byArea.set(task.area, list);
  }
  return [...byArea.entries()].map(([areaId, taskScores]) => {
    const points = taskScores.reduce((s, t) => s + t.points, 0);
    const maxPoints = taskScores.reduce((s, t) => s + t.maxPoints, 0);
    const timedTasks = taskScores.filter((t) => t.task.timeLimitMs);
    // Bei rein zeitbasierten Bereichen (Lesegeschwindigkeit) zählt das Tempo-Band der Aufgabe.
    const band =
      timedTasks.length === taskScores.length && timedTasks.length > 0 ? timedTasks[0].band : ratioToBand(points, maxPoints);
    return { area: AREAS[areaId], points, maxPoints, band, tasks: taskScores };
  });
}

/** Grenzwerte in Anlehnung an Handbuch Teil III, Kap. 5 (Teilpaket AB) – anteilig auf die Itemzahl umgerechnet. */
const SLOW_MS = 6_000;

function mathHints(session: Session, tasks: Task[]): Hint[] {
  const hints: Hint[] = [];
  const has = (id: string) => tasks.some((t) => t.id === id) && responsesFor(session, id).length > 0;

  // ZZ – Zahlzerlegungen sowie Plus/Minus im ZR 10 automatisieren
  if (has('ma-zahlzerlegungen') || has('ma-plus-minus')) {
    const rs = [...responsesFor(session, 'ma-zahlzerlegungen'), ...responsesFor(session, 'ma-plus-minus')];
    const wrong = rs.filter((r) => !r.correct).length;
    const slow = rs.filter((r) => r.correct && r.ms > SLOW_MS).length;
    if (wrong > rs.length * 0.25 || slow > rs.length * 0.3) {
      hints.push({
        code: 'ZZ',
        subject: 'mathe',
        title: 'Zahlzerlegungen und Plus/Minus im Zahlenraum bis 10 automatisieren',
        reason: `${wrong} von ${rs.length} Aufgaben falsch, ${slow} auffällig langsam (> ${SLOW_MS / 1000} s).`,
        suggestion:
          'Zerlegungen der Zahlen bis 10 täglich kurz üben (Schüttelbox, Zahlenhaus, Fingerbilder), Kraft der Fünf nutzen, Aufgabenfamilien statt Einzelaufgaben.',
      });
    }
  }

  // GV – Grundvorstellungen zu Rechenoperationen aufbauen
  if (has('ma-rechengeschichten')) {
    const rs = responsesFor(session, 'ma-rechengeschichten');
    const wrong = rs.filter((r) => !r.correct).length;
    if (wrong > rs.length * 0.45) {
      hints.push({
        code: 'GV',
        subject: 'mathe',
        title: 'Grundvorstellungen zu Rechenoperationen aufbauen',
        reason: `${wrong} von ${rs.length} Rechengeschichten falsch gelöst.`,
        suggestion:
          'Rechengeschichten handelnd nachspielen (Material, Zeichnung), Situationen des Hinzufügens, Wegnehmens und Unterschied-Bestimmens bewusst gegenüberstellen; Übersetzen zwischen Geschichte, Bild und Term.',
      });
    }
  }

  // ZF – Überwinden fehlerhafter zählender Vorgehensweisen
  const mathResponses = session.responses.filter((r) => tasks.some((t) => t.id === r.taskId && t.subject === 'mathe'));
  const offByOne = mathResponses.filter((r) => r.offByOne).length;
  if (mathResponses.length > 0 && offByOne >= Math.max(3, Math.round(mathResponses.length * 0.08))) {
    hints.push({
      code: 'ZF',
      subject: 'mathe',
      title: 'Zählendes Rechnen überwinden',
      reason: `${offByOne} Fehler um ±1 über alle Mathematikaufgaben – typisch für zählende Strategien.`,
      suggestion:
        'Strukturierte Mengenbilder (Zehnerfeld, Rechenrahmen) mit Blitzblick-Übungen, Nutzung von Verdopplungs- und Nachbaraufgaben, Ablösung vom Fingerzählen.',
    });
  }

  // SW – Stellenwertverständnis
  const swIds = ['ma-zahlauffassung', 'ma-mengen-klicken', 'ma-anzahlvergleich', 'ma-stellenwerttafel'];
  const sw = swIds.flatMap((id) => responsesFor(session, id));
  if (sw.length > 0) {
    const wrong = sw.filter((r) => !r.correct).length;
    if (wrong > sw.length * 0.35) {
      hints.push({
        code: 'SW',
        subject: 'mathe',
        title: 'Stellenwertverständnis und Bündeln aufbauen',
        reason: `${wrong} von ${sw.length} Aufgaben zur Zahldarstellung falsch (Zehner/Einer, Bündeln, Zahlendreher).`,
        suggestion:
          'Zahlen mit Zehnersystem-Material legen und in die Stellenwerttafel übertragen, Bündeln von zehn Einern zu einem Zehner handelnd erfahren, Zahlwort und Zahlzeichen bewusst gegenüberstellen (Zahlendreher).',
      });
    }
  }
  return hints;
}

/** Graphemtreffer (vereinfacht): Anteil gemeinsamer Zeichen in Reihenfolge (LCS). */
export function graphemeHitRatio(target: string, given: string): number {
  const a = target.toLowerCase();
  const b = given.toLowerCase();
  if (a.length === 0) return 0;
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length] / a.length;
}

function germanHints(session: Session, tasks: Task[]): Hint[] {
  const hints: Hint[] = [];
  const has = (id: string) => tasks.some((t) => t.id === id) && responsesFor(session, id).length > 0;

  if (has('de-lesegeschwindigkeit')) {
    const task = tasks.find((t) => t.id === 'de-lesegeschwindigkeit')!;
    const rs = responsesFor(session, task.id);
    const answered = rs.filter((r) => !r.timedOut);
    const correct = answered.filter((r) => r.correct).length;
    const perMinute = (answered.length / (task.timeLimitMs ?? 60_000)) * 60_000;
    if (answered.length > 0 && correct / answered.length < 0.75) {
      hints.push({
        code: 'LF-W',
        subject: 'deutsch',
        title: 'Lesegeschwindigkeit: Bearbeitung prüfen',
        reason: `Nur ${correct} von ${answered.length} Wörtern richtig sortiert (< 75 %). Vermutlich wurde die Aufgabe nicht instruktionsgemäß bearbeitet.`,
        suggestion: 'Aufgabe mit dem Kind besprechen und wiederholen (Handbuch Teil II, Kap. 3.2.2).',
      });
    } else if (perMinute < 12) {
      hints.push({
        code: 'LF',
        subject: 'deutsch',
        title: 'Leseflüssigkeit fördern',
        reason: `${answered.length} Wörter in ${Math.round((task.timeLimitMs ?? 60_000) / 1000)} Sekunden bearbeitet.`,
        suggestion:
          'Lautleseverfahren (Tandemlesen, wiederholtes Lesen kurzer Texte), Blitzlesen häufiger Wörter, Silbenbögen zur Strukturierung längerer Wörter.',
      });
    }
  }

  if (has('de-lesegenauigkeit')) {
    const rs = responsesFor(session, 'de-lesegenauigkeit');
    const correct = rs.filter((r) => r.correct).length;
    if (correct / rs.length < 0.75) {
      hints.push({
        code: 'LG',
        subject: 'deutsch',
        title: 'Lesegenauigkeit auf Wortebene',
        reason: `${rs.length - correct} von ${rs.length} ähnlichen Wörtern (z. B. Hund/Hand) verwechselt.`,
        suggestion: 'Genaues Dekodieren üben: Minimalpaare lesen und vergleichen, Wörter in Silben gliedern, Lesen mit dem Finger verfolgen.',
      });
    }
  }

  const lvIds = ['de-lueckensaetze', 'de-saetze-verbinden', 'de-buchcover'];
  const lv = lvIds.flatMap((id) => responsesFor(session, id));
  if (lv.length > 0) {
    const points = lv.reduce((s, r) => s + r.points, 0);
    const max = lv.reduce((s, r) => s + r.maxPoints, 0);
    if (points / max < 0.55) {
      hints.push({
        code: 'LV',
        subject: 'deutsch',
        title: 'Leseverständnis auf Satzebene fördern',
        reason: `${points} von ${max} Punkten im Leseverständnis.`,
        suggestion: 'Sätze mit Lücken gemeinsam lesen und Erwartungen formulieren, Satzteile zuordnen, Fragen zu kurzen Sätzen beantworten, Lesen mit Vorwissensaktivierung.',
      });
    }
  }

  if (has('de-woerter-schreiben')) {
    const rs = responsesFor(session, 'de-woerter-schreiben');
    const correct = rs.filter((r) => r.correct).length;
    if (correct / rs.length < 0.5) {
      hints.push({
        code: 'RS',
        subject: 'deutsch',
        title: 'Alphabetische Strategie festigen',
        reason: `${correct} von ${rs.length} Wörtern richtig geschrieben.`,
        suggestion:
          'Deutlich mitsprechen und Laute abhören (Silbenbögen, Lautgebärden), mehrgliedrige Grapheme (sch, ch, ei, au) gezielt üben, Schreibungen mit Bildkarten kontrollieren.',
      });
    }
  }
  return hints;
}

export function evaluate(session: Session, tasks: Task[]): Evaluation {
  const areas = scoreAreas(tasks, session);
  const totals: Record<Subject, { points: number; maxPoints: number }> = {
    deutsch: { points: 0, maxPoints: 0 },
    mathe: { points: 0, maxPoints: 0 },
  };
  for (const a of areas) {
    totals[a.area.subject].points += a.points;
    totals[a.area.subject].maxPoints += a.maxPoints;
  }
  return {
    areas,
    hints: [...mathHints(session, tasks), ...germanHints(session, tasks)],
    totals,
  };
}
