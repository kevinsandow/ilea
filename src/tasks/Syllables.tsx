import { SpeakerButton } from '../components/SpeakerButton';
import { TaskFrame } from '../components/TaskFrame';
import type { ItemOf, ItemResult, Task } from '../types';
import { unknownResult } from './common';

interface Props {
  task: Task;
  item: ItemOf<'syllables'>;
  first: boolean;
  onAnswer: (r: ItemResult) => void;
}

/** Silben klatschen: Auswahl aus 1–4 Händepaaren (vgl. Aufgabenpaket A „Wörter in Silben gliedern“). */
export function Syllables({ task, item, first, onAnswer }: Props) {
  return (
    <TaskFrame instruction={task.instruction} hint={task.hint} speech={first ? `${task.instruction} ${item.word}.` : `${item.word}.`} autoPlay onUnknown={() => onAnswer(unknownResult())}>
      <div className="picture">
        <span aria-hidden="true">{item.emoji}</span>
        <span className="picture__speaker">
          <SpeakerButton text={item.word} small />
        </span>
      </div>
      <div className="options" role="group" aria-label="Anzahl der Silben">
        {[1, 2, 3, 4].map((n) => (
          <button
            key={n}
            type="button"
            className="option"
            aria-label={`${n} Mal klatschen`}
            onClick={() => onAnswer({ given: String(n), correct: n === item.answer, points: n === item.answer ? 1 : 0, maxPoints: 1 })}
          >
            <span className="hands" aria-hidden="true">
              {Array.from({ length: n }, (_, i) => (
                <span key={i}>👏</span>
              ))}
            </span>
          </button>
        ))}
      </div>
    </TaskFrame>
  );
}
