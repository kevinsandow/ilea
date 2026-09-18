import { useState } from 'react';
import { BaseTenBlocks } from '../components/BaseTenBlocks';
import { TaskFrame } from '../components/TaskFrame';
import type { ItemOf, ItemResult, Relation, Task } from '../types';
import { choiceResult, unknownResult } from './common';

interface Props {
  task: Task;
  item: ItemOf<'compare-quantities'>;
  first: boolean;
  onAnswer: (r: ItemResult) => void;
}

const RELATIONS: Relation[] = ['>', '<', '='];

export function CompareQuantities({ task, item, first, onAnswer }: Props) {
  const [sel, setSel] = useState<Relation | null>(null);
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
      <div className="compare">
        <BaseTenBlocks {...item.left} label="linkes Bild" />
        <div className="options" role="radiogroup" aria-label="Vergleichszeichen">
          {RELATIONS.map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={sel === r}
              className={`option option--symbol ${sel === r ? 'option--selected' : ''}`}
              onClick={() => setSel(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <BaseTenBlocks {...item.right} label="rechtes Bild" />
      </div>
    </TaskFrame>
  );
}
