import { useEffect } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  /** Tastatureingaben (Ziffern, Backspace) abfangen. */
  keyboard?: boolean;
}

/** Ziffernblock wie in der Stellenwerttafel-Aufgabe; Tastatur wird ebenfalls akzeptiert. */
export function Numpad({ value, onChange, maxLength = 3, keyboard = true }: Props) {
  useEffect(() => {
    if (!keyboard) return;
    const handler = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        if (value.length < maxLength) onChange(value + e.key);
        e.preventDefault();
      } else if (e.key === 'Backspace') {
        onChange(value.slice(0, -1));
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [keyboard, maxLength, onChange, value]);

  const press = (d: string) => {
    if (value.length >= maxLength) return;
    onChange(value === '0' ? d : value + d);
  };

  return (
    <div className="numpad" role="group" aria-label="Ziffernblock">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
        <button key={d} type="button" onClick={() => press(d)}>
          {d}
        </button>
      ))}
      <button type="button" className="numpad__zero" onClick={() => press('0')}>
        0
      </button>
    </div>
  );
}

export function NumberField({ value, label }: { value: string; label?: string }) {
  return (
    <div className={`field ${value === '' ? 'field--empty' : ''}`} aria-label={label ?? 'Eingabe'} aria-live="polite">
      {value === '' ? ' ' : value}
    </div>
  );
}
