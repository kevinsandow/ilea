/**
 * Datenmodell für Aufgabenpakete, Items und Antworten.
 *
 * Ein `Task` entspricht einer Aufgabe im Sinne des ILeA-plus-Handbuchs
 * (z. B. „Zahlzerlegungen“) und enthält mehrere `Item`s (Einzelfragen).
 * Jede Item-Art (`kind`) hat eine eigene View-Komponente in `src/tasks/`.
 */

export type Subject = 'deutsch' | 'mathe';

/** Kompetenzbereich nach Rahmenlehrplan Berlin-Brandenburg (vereinfacht). */
export type AreaId =
  | 'ma-zahlen-auffassen'
  | 'ma-zahlen-ordnen'
  | 'ma-zahlbeziehungen'
  | 'ma-operationen'
  | 'ma-rechenstrategien'
  | 'de-phonologische-bewusstheit'
  | 'de-lesefluessigkeit'
  | 'de-leseverstaendnis'
  | 'de-rechtschreiben';

export interface Area {
  id: AreaId;
  subject: Subject;
  label: string;
}

export interface TensOnes {
  tens: number;
  ones: number;
}

export type QuickSeeDisplay =
  | { type: 'fingers'; count: number }
  | { type: 'dots'; count: number }
  | { type: 'frame'; count: number };

interface ItemBase {
  id: string;
}

export type Item =
  | (ItemBase & { kind: 'quick-see'; display: QuickSeeDisplay; answer: number; showMs: number })
  | (ItemBase & { kind: 'number-grasp'; blocks: TensOnes; answer: number })
  | (ItemBase & { kind: 'click-quantity'; target: number })
  | (ItemBase & { kind: 'compare-quantities'; left: TensOnes; right: TensOnes; answer: Relation })
  | (ItemBase & { kind: 'compare-spoken'; a: number; b: number })
  | (ItemBase & { kind: 'decompose'; total: number; given: number })
  | (ItemBase & { kind: 'context'; text: string; picture?: { emoji: string; count: number }; answer: number })
  | (ItemBase & { kind: 'plus-minus'; a: number; op: '+' | '-'; b: number; options: number[] })
  | (ItemBase & { kind: 'place-value'; number: number })
  | (ItemBase & { kind: 'animal-word'; word: string; isAnimal: boolean })
  | (ItemBase & { kind: 'gap-sentence'; before: string; after: string; options: string[]; answer: string })
  | (ItemBase & { kind: 'sentence-match'; pairs: { start: string; end: string }[] })
  | (ItemBase & { kind: 'book-cover'; question: string; covers: { title: string; emoji: string }[]; answer: number })
  | (ItemBase & { kind: 'spell-word'; word: string; article: 'der' | 'die' | 'das'; emoji: string })
  | (ItemBase & { kind: 'syllables'; word: string; emoji: string; answer: number });

export type ItemKind = Item['kind'];
export type ItemOf<K extends ItemKind> = Extract<Item, { kind: K }>;

export type Relation = '<' | '=' | '>';

export interface Task {
  id: string;
  subject: Subject;
  area: AreaId;
  /** Kurzer Titel, wie im Handbuch („Schnelles Sehen“). */
  title: string;
  /** Wird angezeigt und vorgelesen. */
  instruction: string;
  /** Kleingedruckter Zusatzhinweis unter der Anweisung. */
  hint?: string;
  items: Item[];
  /** Zeitlimit für die gesamte Aufgabe (z. B. Lesegeschwindigkeit). */
  timeLimitMs?: number;
}

/** Ergebnis, das eine Item-View nach Beantwortung meldet. */
export interface ItemResult {
  /** Rohantwort als Text (für die Lehrkraft-Ansicht). */
  given: string;
  correct: boolean;
  points: number;
  maxPoints: number;
  /** Fehler um ±1 – Hinweis auf zählendes Rechnen (Handbuch Teil III, Kap. 5.3). */
  offByOne?: boolean;
  /** Kind hat „?“ gedrückt. */
  unknown?: boolean;
}

export interface Response extends ItemResult {
  taskId: string;
  itemId: string;
  ms: number;
  /** Item wurde wegen Zeitablauf nicht mehr bearbeitet. */
  timedOut?: boolean;
}

export interface Session {
  id: string;
  /** Vom Kind eingegebener Name/Code. */
  child: string;
  subjects: Subject[];
  startedAt: string;
  finishedAt?: string;
  responses: Response[];
}
