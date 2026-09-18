import { useState } from 'react';
import { speak } from '../audio/speech';
import { LeoAndLea } from '../components/Characters';
import { SpeakerButton } from '../components/SpeakerButton';
import type { Subject } from '../types';

interface Props {
  onStart: (child: string, subjects: Subject[]) => void;
  onTeacher: () => void;
}

const WELCOME = 'Hallo! Wir sind Leo und Lea. Schön, dass du da bist. Schreib deinen Namen auf und such dir aus, was du machen möchtest.';

export function StartScreen({ onStart, onTeacher }: Props) {
  const [child, setChild] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>(['deutsch', 'mathe']);

  const toggle = (s: Subject) => setSubjects((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  const canStart = child.trim().length > 0 && subjects.length > 0;

  return (
    <div className="start">
      <div className="start__scene">
        <LeoAndLea size={170} />
      </div>
      <div className="start__panel">
        <div className="panel">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h1>Hallo!</h1>
            <SpeakerButton text={WELCOME} autoPlay />
          </div>
          <p>Wir sind Leo und Lea. Wir zeigen dir ein paar Aufgaben. Es ist kein Test – mach einfach mit, so gut du kannst.</p>
        </div>

        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            if (canStart) {
              speak('Los geht’s!');
              onStart(child.trim(), ['deutsch', 'mathe'].filter((s) => subjects.includes(s as Subject)) as Subject[]);
            }
          }}
        >
          <h2>Wie heißt du?</h2>
          <input className="textinput" value={child} onChange={(e) => setChild(e.target.value)} placeholder="Dein Name oder Code" aria-label="Name oder Code" autoFocus />

          <h2 style={{ marginTop: 18 }}>Was möchtest du machen?</h2>
          <div className="subjects" role="group" aria-label="Fächer">
            <button type="button" className={`subject ${subjects.includes('deutsch') ? 'subject--on' : ''}`} aria-pressed={subjects.includes('deutsch')} onClick={() => toggle('deutsch')}>
              <span aria-hidden="true" style={{ fontSize: 32 }}>
                📖
              </span>
              Deutsch
              <small>Lesen · Schreiben · Silben</small>
            </button>
            <button type="button" className={`subject ${subjects.includes('mathe') ? 'subject--on' : ''}`} aria-pressed={subjects.includes('mathe')} onClick={() => toggle('mathe')}>
              <span aria-hidden="true" style={{ fontSize: 32 }}>
                🔢
              </span>
              Mathematik
              <small>Zahlen · Mengen · Rechnen</small>
            </button>
          </div>

          <div className="row" style={{ marginTop: 20, justifyContent: 'space-between' }}>
            <button type="button" className="linkbtn" style={{ color: 'var(--muted)', borderColor: 'var(--field-border)' }} onClick={onTeacher}>
              Lehrkraft-Bereich
            </button>
            <button type="submit" className="bigbtn bigbtn--ok" disabled={!canStart}>
              Los geht’s
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
