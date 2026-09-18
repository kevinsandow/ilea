import type { ItemOf, ItemResult, Task } from '../types';
import { NumericTask } from './NumericTask';

interface Props {
  task: Task;
  item: ItemOf<'decompose'>;
  first: boolean;
  onAnswer: (r: ItemResult) => void;
}

export function Decompose({ task, item, first, onAnswer }: Props) {
  return (
    <NumericTask
      instruction={task.instruction}
      hint={task.hint}
      autoPlay={first}
      answer={item.total - item.given}
      onAnswer={onAnswer}
      prefix={`${item.given} +`}
      suffix={`= ${item.total}`}
      maxLength={2}
    />
  );
}
