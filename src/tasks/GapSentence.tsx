import { useState } from 'react';
import { TaskFrame } from '../components/TaskFrame';
import type { ItemOf, ItemResult, Task } from '../types';
import { choiceResult, unknownResult } from './common';

interface Props {
  task: Task;
  item: ItemOf<'gap-sentence'>;
  first: boolean;
  onAnswer: (r: ItemResult) => void;
}

export function GapSentence({ task, item, first, onAnswer }: Props) {
  const [sel, setSel] = useState<string | null>(null);
  return (
    <TaskFrame
      instruction={task.instruction}
      hint={task.hint}
      autoPlay={first}
      onOk={() => sel && onAnswer(choiceResult(sel, sel === item.answer))}
      okDisabled={!sel}
      onClear={() => setSel(null)}
      onUnknown={() => onAnswer(unknownResult())}
    >
      <p className="sentence">
        {item.before}
        <span className="sentence__gap">{sel ?? ' '}</span>
        {item.after}
      </p>
      <div className="options options--grid" role="radiogroup" aria-label="Wörter">
        {item.options.map((o) => (
          <button key={o} type="button" role="radio" aria-checked={sel === o} className={`option ${sel === o ? 'option--selected' : ''}`} onClick={() => setSel(o)}>
            {o}
          </button>
        ))}
      </div>
    </TaskFrame>
  );
}
