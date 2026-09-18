import type { ItemOf, ItemResult, Task } from '../types';
import { NumericTask } from './NumericTask';

interface Props {
  task: Task;
  item: ItemOf<'context'>;
  onAnswer: (r: ItemResult) => void;
}

export function Context({ task, item, onAnswer }: Props) {
  return (
    <NumericTask instruction={task.instruction} hint={task.hint} speech={item.text} autoPlay answer={item.answer} onAnswer={onAnswer} maxLength={2}>
      <div className="story">
        <p>{item.text}</p>
        {item.picture && (
          <div className="story__pic" aria-label={`${item.picture.count} ${item.picture.emoji}`}>
            {item.picture.emoji.repeat(item.picture.count)}
          </div>
        )}
      </div>
    </NumericTask>
  );
}
