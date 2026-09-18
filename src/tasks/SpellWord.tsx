import { useEffect, useRef, useState } from 'react';
import { SpeakerButton } from '../components/SpeakerButton';
import { TaskFrame } from '../components/TaskFrame';
import type { ItemOf, ItemResult, Task } from '../types';
import { unknownResult } from './common';

interface Props {
  task: Task;
  item: ItemOf<'spell-word'>;
  first: boolean;
  onAnswer: (r: ItemResult) => void;
}

/**
 * Wörter schreiben (Bildvorlage + Sprachausgabe). Groß-/Kleinschreibung wird
 * in B1 noch nicht als Fehler gezählt (Handbuch Teil II, Kap. 4.2.2).
 */
export function spellResult(target: string, given: string): ItemResult {
  const g = given.trim();
  const correct = g.toLowerCase() === target.toLowerCase();
  return {
    given: g,
    correct,
    points: correct ? 1 : 0,
    maxPoints: 1,
  };
}

export function SpellWord({ task, item, first, onAnswer }: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const spoken = `${item.article} ${item.word}`;

  useEffect(() => {
    inputRef.current?.focus();
  }, [item.id]);

  const submit = () => onAnswer(spellResult(item.word, value));

  return (
    <TaskFrame
      instruction={task.instruction}
      hint={task.hint}
      speech={first ? `${task.instruction} ${spoken}.` : `${spoken}.`}
      autoPlay
      onOk={submit}
      okDisabled={value.trim() === ''}
      onClear={() => {
        setValue('');
        inputRef.current?.focus();
      }}
      onUnknown={() => onAnswer(unknownResult())}
    >
      <div className="picture">
        <span aria-hidden="true">{item.emoji}</span>
        <span className="picture__speaker">
          <SpeakerButton text={spoken} small />
        </span>
      </div>
      <div className="inputrow">
        <span className="inputrow__label">{item.article}</span>
        <label className="field field--text">
          <span className="sr-only">Wort eingeben</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && value.trim() !== '') submit();
            }}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            lang="de"
          />
        </label>
      </div>
    </TaskFrame>
  );
}
