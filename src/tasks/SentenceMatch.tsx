import { useMemo, useState } from 'react';
import { TaskFrame } from '../components/TaskFrame';
import type { ItemOf, ItemResult, Task } from '../types';
import { unknownResult } from './common';

interface Props {
  task: Task;
  item: ItemOf<'sentence-match'>;
  first: boolean;
  onAnswer: (r: ItemResult) => void;
}

/** Deterministische Mischung der Satzenden, damit die richtige Zuordnung nicht in der Reihenfolge steckt. */
function shuffledEnds(pairs: { end: string }[]): string[] {
  const ends = pairs.map((p) => p.end);
  // Rotation um 1 statt Zufall: reproduzierbar und für Tests stabil.
  return ends.length > 1 ? [...ends.slice(1), ends[0]] : ends;
}

/** Sätze vervollständigen: 2 Punkte bei allen richtig, 1 Punkt bei einer richtigen Zuordnung (Handbuch Teil II, Kap. 3.2.3). */
export function scoreMatches(pairs: { start: string; end: string }[], links: Record<string, string>): number {
  const correct = pairs.filter((p) => links[p.start] === p.end).length;
  if (correct === pairs.length) return 2;
  if (correct >= 1) return 1;
  return 0;
}

export function SentenceMatch({ task, item, first, onAnswer }: Props) {
  const ends = useMemo(() => shuffledEnds(item.pairs), [item.pairs]);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [activeStart, setActiveStart] = useState<string | null>(null);

  const complete = Object.keys(links).length === item.pairs.length;

  const chooseEnd = (end: string) => {
    if (!activeStart) return;
    setLinks((l) => {
      const next: Record<string, string> = {};
      for (const [s, e] of Object.entries(l)) if (e !== end) next[s] = e;
      next[activeStart] = end;
      return next;
    });
    setActiveStart(null);
  };

  const submit = () => {
    const points = scoreMatches(item.pairs, links);
    onAnswer({
      given: item.pairs.map((p) => `${p.start} → ${links[p.start] ?? '–'}`).join(' | '),
      correct: points === 2,
      points,
      maxPoints: 2,
    });
  };

  const badgeFor = (end: string) => {
    const idx = item.pairs.findIndex((p) => links[p.start] === end);
    return idx >= 0 ? idx + 1 : null;
  };

  return (
    <TaskFrame
      instruction={task.instruction}
      hint={task.hint}
      autoPlay={first}
      onOk={submit}
      okDisabled={!complete}
      onClear={() => {
        setLinks({});
        setActiveStart(null);
      }}
      onUnknown={() => onAnswer(unknownResult(2))}
    >
      <div className="match">
        {item.pairs.map((p, i) => (
          <div className="match__pair" key={p.start}>
            <button
              type="button"
              className={`option ${activeStart === p.start ? 'option--selected' : ''} ${links[p.start] ? 'match__link' : ''}`}
              aria-pressed={activeStart === p.start}
              onClick={() => setActiveStart(p.start)}
            >
              <span className="badge">{i + 1}</span>
              {p.start}
            </button>
            <button
              type="button"
              className={`option ${badgeFor(ends[i]) ? 'option--selected' : ''}`}
              disabled={!activeStart}
              onClick={() => chooseEnd(ends[i])}
            >
              {badgeFor(ends[i]) && <span className="badge">{badgeFor(ends[i])}</span>}
              {ends[i]}
            </button>
          </div>
        ))}
      </div>
    </TaskFrame>
  );
}
