import { useState, type ReactNode } from 'react';
import { Numpad, NumberField } from '../components/Numpad';
import { TaskFrame } from '../components/TaskFrame';
import type { ItemResult } from '../types';
import { numericResult, unknownResult } from './common';

interface Props {
  instruction: string;
  hint?: string;
  speech?: string;
  autoPlay?: boolean;
  answer: number;
  onAnswer: (r: ItemResult) => void;
  children?: ReactNode;
  /** Beschriftung links vom Eingabefeld, z. B. „7 + “ */
  prefix?: ReactNode;
  suffix?: ReactNode;
  maxLength?: number;
  /** Eingabe gesperrt (z. B. solange das Blitzbild noch nicht gezeigt wurde). */
  locked?: boolean;
}

/** Aufgabenrahmen mit Ziffernblock – Basis für alle Aufgaben mit Zahleingabe. */
export function NumericTask({ instruction, hint, speech, autoPlay, answer, onAnswer, children, prefix, suffix, maxLength = 3, locked }: Props) {
  const [value, setValue] = useState('');

  return (
    <TaskFrame
      instruction={instruction}
      hint={hint}
      speech={speech}
      autoPlay={autoPlay}
      onOk={() => onAnswer(numericResult(value, answer))}
      okDisabled={value === '' || locked}
      onClear={() => setValue('')}
      onUnknown={() => onAnswer(unknownResult())}
    >
      {children}
      {!locked && (
        <div className="inputrow">
          {prefix && <span className="inputrow__label">{prefix}</span>}
          <NumberField value={value} />
          {suffix && <span className="inputrow__label">{suffix}</span>}
          <Numpad value={value} onChange={setValue} maxLength={maxLength} />
        </div>
      )}
    </TaskFrame>
  );
}
