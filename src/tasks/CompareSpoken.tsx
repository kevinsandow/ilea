import { numberToGerman } from '../audio/numberWords';
import { useGermanVoice } from '../audio/useGermanVoice';
import type { ItemOf, ItemResult, Task } from '../types';
import { NumericTask } from './NumericTask';

interface Props {
  task: Task;
  item: ItemOf<'compare-spoken'>;
  onAnswer: (r: ItemResult) => void;
}

export function CompareSpoken({ task, item, onAnswer }: Props) {
  const spoken = `${numberToGerman(item.a)} oder ${numberToGerman(item.b)}`;
  const hasVoice = useGermanVoice();
  return (
    <NumericTask
      instruction={task.instruction}
      hint={task.hint}
      speech={`${task.instruction} ${spoken}.`}
      autoPlay
      answer={Math.max(item.a, item.b)}
      onAnswer={onAnswer}
    >
      {/* Ohne deutsche Stimme werden die Zahlwörter als Text gezeigt, damit die Aufgabe lösbar bleibt. */}
      {!hasVoice && <p className="sentence">{spoken}</p>}
    </NumericTask>
  );
}
