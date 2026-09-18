import { useState } from 'react';
import { TaskFrame } from '../components/TaskFrame';
import type { ItemOf, ItemResult, Task } from '../types';
import { choiceResult, unknownResult } from './common';

interface Props {
  task: Task;
  item: ItemOf<'book-cover'>;
  onAnswer: (r: ItemResult) => void;
}

export function BookCover({ task, item, onAnswer }: Props) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <TaskFrame
      instruction={item.question}
      hint={task.hint}
      speech={item.question}
      autoPlay
      onOk={() => sel !== null && onAnswer(choiceResult(item.covers[sel].title, sel === item.answer))}
      okDisabled={sel === null}
      onClear={() => setSel(null)}
      onUnknown={() => onAnswer(unknownResult())}
    >
      <div className="options options--row" role="radiogroup" aria-label="Bücher">
        {item.covers.map((c, i) => (
          <button key={c.title} type="button" role="radio" aria-checked={sel === i} className={`option option--cover ${sel === i ? 'option--selected' : ''}`} onClick={() => setSel(i)}>
            <div className="cover">
              <span aria-hidden="true">{c.emoji}</span>
              <span className="cover__title">{c.title}</span>
            </div>
          </button>
        ))}
      </div>
    </TaskFrame>
  );
}
