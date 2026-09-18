import { TaskFrame } from '../components/TaskFrame';
import type { ItemOf, ItemResult, Task } from '../types';
import { unknownResult } from './common';

interface Props {
  task: Task;
  item: ItemOf<'plus-minus'>;
  first: boolean;
  onAnswer: (r: ItemResult) => void;
}

export function PlusMinus({ task, item, first, onAnswer }: Props) {
  const answer = item.op === '+' ? item.a + item.b : item.a - item.b;
  return (
    <TaskFrame instruction={task.instruction} autoPlay={first} onUnknown={() => onAnswer(unknownResult())}>
      <div className="word">
        {item.a} {item.op === '+' ? '+' : '−'} {item.b} =
      </div>
      <div className="options options--row">
        {item.options.map((o) => (
          <button
            key={o}
            type="button"
            className="option option--big"
            onClick={() =>
              onAnswer({
                given: String(o),
                correct: o === answer,
                points: o === answer ? 1 : 0,
                maxPoints: 1,
                offByOne: o !== answer && Math.abs(o - answer) === 1,
              })
            }
          >
            {o}
          </button>
        ))}
      </div>
    </TaskFrame>
  );
}
