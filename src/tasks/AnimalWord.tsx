import { TaskFrame } from '../components/TaskFrame';
import type { ItemOf, ItemResult, Task } from '../types';
import { choiceResult } from './common';

interface Props {
  task: Task;
  item: ItemOf<'animal-word'>;
  first: boolean;
  onAnswer: (r: ItemResult) => void;
  /** Restzeit in Sekunden (bei Zeitlimit). */
  secondsLeft?: number;
}

/** Tierwort ja/nein – Lesegeschwindigkeit bzw. Lesegenauigkeit (Handbuch Teil II, Kap. 3.2.2). */
export function AnimalWord({ task, item, first, onAnswer, secondsLeft }: Props) {
  return (
    <TaskFrame
      instruction={task.instruction}
      hint={task.hint}
      autoPlay={first}
      corner={secondsLeft !== undefined && <span className="timer" aria-live="off">{secondsLeft} s</span>}
    >
      <div className="word" lang="de">
        {item.word}
      </div>
      <div className="yesno">
        <button type="button" className="yesno__yes" onClick={() => onAnswer(choiceResult('ja', item.isAnimal))}>
          Ja
        </button>
        <button type="button" className="yesno__no" onClick={() => onAnswer(choiceResult('nein', !item.isAnimal))}>
          Nein
        </button>
      </div>
    </TaskFrame>
  );
}
