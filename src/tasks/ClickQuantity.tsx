import { useState } from 'react';
import { BaseTenBlocks } from '../components/BaseTenBlocks';
import { TaskFrame } from '../components/TaskFrame';
import type { ItemOf, ItemResult, Task } from '../types';
import { unknownResult } from './common';

interface Props {
  task: Task;
  item: ItemOf<'click-quantity'>;
  first: boolean;
  onAnswer: (r: ItemResult) => void;
}

export function ClickQuantity({ task, item, first, onAnswer }: Props) {
  const [tens, setTens] = useState(0);
  const [ones, setOnes] = useState(0);
  const value = tens * 10 + ones;

  const submit = () => {
    const correct = value === item.target;
    onAnswer({
      given: `${tens} Z ${ones} E (${value})`,
      correct,
      points: correct ? 1 : 0,
      maxPoints: 1,
      offByOne: !correct && Math.abs(value - item.target) === 1,
    });
  };

  return (
    <TaskFrame
      instruction={task.instruction}
      hint={task.hint}
      autoPlay={first}
      onOk={submit}
      okDisabled={value === 0}
      onClear={() => {
        setTens(0);
        setOnes(0);
      }}
      onUnknown={() => onAnswer(unknownResult())}
    >
      <div className="word" aria-label={`Zielzahl ${item.target}`}>
        {item.target}
      </div>
      <BaseTenBlocks tens={tens} ones={ones} label="Deine Darstellung" />
      <div className="options">
        <button type="button" className="option" onClick={() => setTens((t) => Math.min(9, t + 1))}>
          <span className="rod" style={{ display: 'inline-block', height: 40, verticalAlign: 'middle', marginRight: 10 }} /> Zehner dazu
        </button>
        <button type="button" className="option" onClick={() => setOnes((o) => Math.min(19, o + 1))}>
          <span className="cube" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 10 }} /> Einer dazu
        </button>
      </div>
    </TaskFrame>
  );
}
