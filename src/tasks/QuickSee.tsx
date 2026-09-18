import { useEffect, useState } from 'react';
import type { ItemOf, ItemResult, QuickSeeDisplay, Task } from '../types';
import { NumericTask } from './NumericTask';

interface Props {
  task: Task;
  item: ItemOf<'quick-see'>;
  first: boolean;
  onAnswer: (r: ItemResult) => void;
}

function Fingers({ count }: { count: number }) {
  const left = Math.min(5, count);
  const right = Math.max(0, count - 5);
  const hand = (up: number) => (
    <div className="hand" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className={`finger ${i < up ? '' : 'finger--down'}`} />
      ))}
    </div>
  );
  return (
    <div className="fingers" role="img" aria-label={`${count} Finger`}>
      {hand(left)}
      {hand(right)}
    </div>
  );
}

function TenFrame({ count }: { count: number }) {
  return (
    <div className="tenframe" role="img" aria-label={`${count} Punkte im Zehnerfeld`}>
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="tenframe__cell">
          {i < count && <div className="tenframe__dot" />}
        </div>
      ))}
    </div>
  );
}

/** Rechenrahmen (20er): zwei Reihen à 10 Perlen, Farbwechsel nach 5. */
export function Frame({ count }: { count: number }) {
  const rows = Math.ceil(Math.max(count, 1) / 10);
  return (
    <div className="frame" role="img" aria-label={`${count} Perlen am Rechenrahmen`}>
      {Array.from({ length: Math.max(rows, 2) }, (_, r) => (
        <div key={r} className="frame__row">
          {Array.from({ length: 10 }, (_, c) => {
            const idx = r * 10 + c;
            const on = idx < count;
            const color = c < 5 ? 'bead--red' : 'bead--blue';
            return <div key={c} className={`bead ${on ? color : 'bead--off'}`} />;
          })}
        </div>
      ))}
    </div>
  );
}

export function QuickSeeDisplayView({ display }: { display: QuickSeeDisplay }) {
  switch (display.type) {
    case 'fingers':
      return <Fingers count={display.count} />;
    case 'dots':
      return <TenFrame count={display.count} />;
    case 'frame':
      return <Frame count={display.count} />;
  }
}

type Phase = 'ready' | 'showing' | 'done';

export function QuickSee({ task, item, first, onAnswer }: Props) {
  const [phase, setPhase] = useState<Phase>('ready');

  useEffect(() => {
    if (phase !== 'showing') return;
    const t = window.setTimeout(() => setPhase('done'), item.showMs);
    return () => window.clearTimeout(t);
  }, [phase, item.showMs]);

  return (
    <NumericTask
      instruction={task.instruction}
      hint={task.hint}
      autoPlay={first}
      answer={item.answer}
      onAnswer={onAnswer}
      locked={phase !== 'done'}
      maxLength={2}
    >
      <div className="flash">
        {phase === 'ready' && (
          <button type="button" className="bigbtn" onClick={() => setPhase('showing')}>
            Start
          </button>
        )}
        {phase === 'showing' && <QuickSeeDisplayView display={item.display} />}
        {phase === 'done' && <span className="flash__hidden">Wie viele waren es?</span>}
      </div>
    </NumericTask>
  );
}
