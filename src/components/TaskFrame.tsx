import type { ReactNode } from 'react';
import { OkButton, TrashButton, UnknownButton } from './RoundButton';
import { SpeakerButton } from './SpeakerButton';

interface Props {
  instruction: string;
  hint?: string;
  /** Text, der beim Lautsprecher vorgelesen wird (Standard: instruction). */
  speech?: string;
  autoPlay?: boolean;
  children: ReactNode;
  onOk?: () => void;
  okDisabled?: boolean;
  onClear?: () => void;
  onUnknown?: () => void;
  extraFooter?: ReactNode;
  corner?: ReactNode;
}

/**
 * Weißer Aufgabenrahmen wie in ILeA plus: Lautsprecher + Anweisung oben,
 * Inhalt in der Mitte, OK / ? / Papierkorb unten rechts.
 */
export function TaskFrame({ instruction, hint, speech, autoPlay = true, children, onOk, okDisabled, onClear, onUnknown, extraFooter, corner }: Props) {
  return (
    <section className="card" aria-label={instruction}>
      {corner}
      <header className="card__head">
        <SpeakerButton text={speech ?? instruction} autoPlay={autoPlay} />
        <div>
          <p className="card__instruction">{instruction}</p>
          {hint && <p className="card__hint">{hint}</p>}
        </div>
      </header>
      <div className="card__body">{children}</div>
      <footer className="card__foot">
        {extraFooter}
        {onUnknown && <UnknownButton onClick={onUnknown} />}
        {onClear && <TrashButton onClick={onClear} />}
        {onOk && <OkButton onClick={onOk} disabled={okDisabled} />}
      </footer>
    </section>
  );
}
