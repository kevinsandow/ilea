import { useMemo, useState } from 'react';
import { ALL_TASKS, findTask } from '../data';
import { BAND_LABEL, evaluate, graphemeHitRatio, type Band } from '../engine/scoring';
import type { Response, Session, Subject } from '../types';

interface Props {
  sessions: Session[];
  initialSessionId?: string;
  onDelete: (id: string) => void;
  onHome: () => void;
}

const TEACHER_CODE = 'lisum';
const SUBJECT_LABEL: Record<Subject, string> = { deutsch: 'Deutsch', mathe: 'Mathematik' };

function BandChip({ band }: { band: Band }) {
  return <span className={`band band--${band}`}>{BAND_LABEL[band]}</span>;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
}

function describeResponse(r: Response): string {
  const task = findTask(r.taskId);
  const item = task?.items.find((i) => i.id === r.itemId);
  if (!item) return r.given;
  switch (item.kind) {
    case 'spell-word': {
      const gt = Math.round(graphemeHitRatio(item.word, r.given) * 100);
      return `${item.word} → „${r.given || '–'}“ (Graphemtreffer ${gt} %)`;
    }
    case 'animal-word':
      return `${item.word} → ${r.given || '–'}`;
    case 'decompose':
      return `${item.given} + ? = ${item.total} → ${r.given}`;
    case 'plus-minus':
      return `${item.a} ${item.op} ${item.b} → ${r.given}`;
    case 'compare-spoken':
      return `${item.a} / ${item.b} → ${r.given}`;
    case 'place-value':
      return `${item.number} → ${r.given}`;
    case 'quick-see':
      return `${item.display.type} ${item.display.count} → ${r.given}`;
    case 'number-grasp':
      return `${item.blocks.tens} Z ${item.blocks.ones} E → ${r.given}`;
    case 'click-quantity':
      return `${item.target} → ${r.given}`;
    case 'compare-quantities':
      return `${item.left.tens}Z${item.left.ones}E ? ${item.right.tens}Z${item.right.ones}E → ${r.given}`;
    case 'gap-sentence':
      return `${item.before} ___ ${item.after} → ${r.given}`;
    case 'syllables':
      return `${item.word} → ${r.given} Silben`;
    case 'context':
      return `Antwort ${item.answer} → ${r.given}`;
    default:
      return r.given;
  }
}

function download(session: Session) {
  const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ilea-plus-${session.child}-${session.startedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Lehrkraft-Ansicht: Sitzungen, Ergebnisse je Kompetenzbereich, Förderhinweise. */
export function ResultsScreen({ sessions, initialSessionId, onDelete, onHome }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>(initialSessionId ?? sessions[0]?.id);

  const session = sessions.find((s) => s.id === selectedId) ?? sessions[0];
  const evaluation = useMemo(() => (session ? evaluate(session, ALL_TASKS) : null), [session]);

  if (!unlocked) {
    return (
      <div className="finish">
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim().toLowerCase() === TEACHER_CODE) setUnlocked(true);
          }}
        >
          <h1>Lehrkraft-Bereich</h1>
          <p>Bitte gib den Lehrkraft-Code ein.</p>
          <input className="textinput" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Lehrkraft-Code" autoFocus />
          <p className="muted">Demo-Code: {TEACHER_CODE}</p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button type="button" className="bigbtn bigbtn--ghost" onClick={onHome}>
              Zurück
            </button>
            <button type="submit" className="bigbtn">
              Öffnen
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="results">
      <div className="panel">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0 }}>Auswertung</h1>
          <button type="button" className="bigbtn bigbtn--ghost" onClick={onHome}>
            Zum Start
          </button>
        </div>
        <p className="muted">
          Die Ergebnisse dienen als Orientierung für die individuelle Förderplanung. Grenzwerte sind an das ILeA-plus-Handbuch angelehnt, aber nicht normiert.
        </p>
      </div>

      <div className="panel">
        <h2>Sitzungen</h2>
        {sessions.length === 0 && <p>Noch keine Sitzung gespeichert.</p>}
        <div className="sessions">
          {sessions.map((s) => (
            <div key={s.id} className="sessions__row" style={s.id === session?.id ? { outline: '2px solid var(--accent)' } : undefined}>
              <strong>{s.child}</strong>
              <span className="muted">{fmtDate(s.startedAt)}</span>
              <span className="muted">{s.subjects.map((x) => SUBJECT_LABEL[x]).join(' + ')}</span>
              <span className="muted">{s.finishedAt ? 'abgeschlossen' : 'abgebrochen'}</span>
              <button type="button" className="linkbtn" style={{ color: 'var(--ink)', borderColor: 'var(--field-border)' }} onClick={() => setSelectedId(s.id)}>
                Anzeigen
              </button>
              <button type="button" className="linkbtn" style={{ color: 'var(--ink)', borderColor: 'var(--field-border)' }} onClick={() => download(s)}>
                JSON
              </button>
              <button
                type="button"
                className="linkbtn"
                style={{ color: 'var(--bad)', borderColor: 'var(--bad)' }}
                onClick={() => {
                  if (window.confirm(`Sitzung von ${s.child} löschen?`)) onDelete(s.id);
                }}
              >
                Löschen
              </button>
            </div>
          ))}
        </div>
      </div>

      {session && evaluation && (
        <>
          <div className="panel">
            <h2>
              {session.child} · {fmtDate(session.startedAt)}
            </h2>
            <div className="row">
              {(['deutsch', 'mathe'] as Subject[])
                .filter((s) => evaluation.totals[s].maxPoints > 0)
                .map((s) => (
                  <div key={s} className="tasklist__row" style={{ minWidth: 220 }}>
                    <strong>{SUBJECT_LABEL[s]}</strong>
                    <span>
                      {evaluation.totals[s].points} / {evaluation.totals[s].maxPoints} Punkte
                    </span>
                  </div>
                ))}
            </div>

            <table style={{ marginTop: 16 }}>
              <thead>
                <tr>
                  <th>Kompetenzbereich</th>
                  <th>Punkte</th>
                  <th></th>
                  <th>Einschätzung</th>
                </tr>
              </thead>
              <tbody>
                {evaluation.areas.map((a) => (
                  <tr key={a.area.id}>
                    <td>
                      <strong>{a.area.label}</strong>
                      <div className="muted">{SUBJECT_LABEL[a.area.subject]}</div>
                    </td>
                    <td>
                      {a.points} / {a.maxPoints}
                    </td>
                    <td>
                      <div className="bar" aria-hidden="true">
                        <div className="bar__fill" style={{ width: `${a.maxPoints ? (a.points / a.maxPoints) * 100 : 0}%` }} />
                      </div>
                    </td>
                    <td>
                      <BandChip band={a.band} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel">
            <h2>Förderhinweise</h2>
            {evaluation.hints.length === 0 ? (
              <p>Keine auffälligen Bereiche. Weiterlernen auf dem aktuellen Niveau.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {evaluation.hints.map((h) => (
                  <div key={h.code} className="hint">
                    <h3>
                      {h.code} · {h.title}
                    </h3>
                    <p>
                      <strong>Befund:</strong> {h.reason}
                    </p>
                    <p>
                      <strong>Förderidee:</strong> {h.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <h2>Aufgaben im Detail</h2>
            <div className="tasklist">
              {evaluation.areas.flatMap((a) =>
                a.tasks.map((t) => (
                  <details key={t.task.id}>
                    <summary>
                      {t.task.title} — {t.points}/{t.maxPoints} Punkte
                      {t.task.timeLimitMs ? ` · ${t.answered} Wörter in ${Math.round(t.task.timeLimitMs / 1000)} s` : ''}
                      {t.offByOne > 0 ? ` · ${t.offByOne}× Fehler um ±1` : ''}
                      {t.unknown > 0 ? ` · ${t.unknown}× „?“` : ''}
                      {' · '}
                      <BandChip band={t.band} />
                    </summary>
                    <table>
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Antwort</th>
                          <th>Richtig</th>
                          <th>Zeit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {session.responses
                          .filter((r) => r.taskId === t.task.id)
                          .map((r) => (
                            <tr key={r.itemId}>
                              <td className="muted">{r.itemId}</td>
                              <td>{r.timedOut ? <em className="muted">nicht mehr bearbeitet</em> : describeResponse(r)}</td>
                              <td>{r.timedOut ? '' : r.correct ? '✓' : r.unknown ? '?' : '✗'}</td>
                              <td className="muted">{r.timedOut ? '' : `${(r.ms / 1000).toFixed(1)} s`}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </details>
                )),
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
