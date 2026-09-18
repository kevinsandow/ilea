import { useState } from 'react';
import { numberToGerman } from '../audio/numberWords';
import { useGermanVoice } from '../audio/useGermanVoice';
import { Numpad } from '../components/Numpad';
import { TaskFrame } from '../components/TaskFrame';
import type { ItemOf, ItemResult, Task } from '../types';
import { unknownResult } from './common';

interface Props {
  task: Task;
  item: ItemOf<'place-value'>;
  onAnswer: (r: ItemResult) => void;
}

const COLUMNS = ['H', 'Z', 'E'] as const;
type Col = (typeof COLUMNS)[number];

/** Stellenwerttafel: die diktierte Zahl wird stellenweise eingetragen. */
export function PlaceValue({ task, item, onAnswer }: Props) {
  const [cells, setCells] = useState<Record<Col, string>>({ H: '', Z: '', E: '' });
  const [active, setActive] = useState<Col>('Z');
  const spoken = numberToGerman(item.number);
  const hasVoice = useGermanVoice();

  const filled = COLUMNS.some((c) => cells[c] !== '');
  const value = Number(`${cells.H || '0'}${cells.Z || '0'}${cells.E || '0'}`);

  const setActiveCell = (v: string) => {
    setCells((c) => ({ ...c, [active]: v.slice(-1) }));
    // Nach einer Ziffer automatisch in die nächste Spalte springen.
    if (v !== '') {
      const i = COLUMNS.indexOf(active);
      if (i < COLUMNS.length - 1) setActive(COLUMNS[i + 1]);
    }
  };

  const submit = () => {
    const correct = value === item.number;
    onAnswer({
      given: COLUMNS.map((c) => `${c}:${cells[c] || '–'}`).join(' '),
      correct,
      points: correct ? 1 : 0,
      maxPoints: 1,
    });
  };

  return (
    <TaskFrame
      instruction={task.instruction}
      hint={task.hint}
      speech={`${task.instruction} Die Zahl heißt: ${spoken}.`}
      autoPlay
      onOk={submit}
      okDisabled={!filled}
      onClear={() => {
        setCells({ H: '', Z: '', E: '' });
        setActive('Z');
      }}
      onUnknown={() => onAnswer(unknownResult())}
    >
      <div>
        {!hasVoice && <p className="sentence">{spoken}</p>}
        <table className="pvt">
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {COLUMNS.map((c) => (
                <td key={c}>
                  <button
                    type="button"
                    className={`field ${active === c ? 'field--active' : ''} ${cells[c] === '' ? 'field--empty' : ''}`}
                    aria-label={`Spalte ${c}`}
                    aria-pressed={active === c}
                    onClick={() => setActive(c)}
                  >
                    {cells[c] || ' '}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <Numpad value="" onChange={setActiveCell} maxLength={1} />
    </TaskFrame>
  );
}
