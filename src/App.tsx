import { useCallback, useEffect, useState } from 'react';
import { tasksFor } from './data';
import { deleteSession, loadSessions, newSessionId, saveSession } from './engine/storage';
import { FinishScreen } from './screens/FinishScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { StartScreen } from './screens/StartScreen';
import { TaskRunner } from './screens/TaskRunner';
import type { Response, Session, Subject } from './types';

type Screen = { name: 'start' } | { name: 'run'; session: Session } | { name: 'finish'; session: Session } | { name: 'teacher'; sessionId?: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'start' });
  const [sessions, setSessions] = useState<Session[]>(() => loadSessions());

  const persist = useCallback((session: Session) => {
    saveSession(session);
    setSessions(loadSessions());
  }, []);

  const start = (child: string, subjects: Subject[]) => {
    const session: Session = { id: newSessionId(), child, subjects, startedAt: new Date().toISOString(), responses: [] };
    persist(session);
    setScreen({ name: 'run', session });
  };

  const addResponses = (rs: Response[]) => {
    setScreen((s) => {
      if (s.name !== 'run') return s;
      const session = { ...s.session, responses: [...s.session.responses, ...rs] };
      persist(session);
      return { name: 'run', session };
    });
  };

  const finish = () => {
    setScreen((s) => {
      if (s.name !== 'run') return s;
      const session = { ...s.session, finishedAt: new Date().toISOString() };
      persist(session);
      return { name: 'finish', session };
    });
  };

  const running = screen.name === 'run';
  const abort = useCallback(() => {
    if (running && !window.confirm('Möchtest du wirklich aufhören? Die bisherigen Antworten bleiben gespeichert.')) return;
    setScreen({ name: 'start' });
  }, [running]);

  // Escape = zum Start (für die Lehrkraft bei Abbruch).
  useEffect(() => {
    if (!running) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') abort();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [running, abort]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__title">
          ILeA <span>plus</span> · Klasse 2
        </div>
        <div className="topbar__spacer" />
        {(screen.name === 'run' || screen.name === 'finish') && <span className="topbar__child">{screen.session.child}</span>}
        {screen.name === 'run' && (
          <button type="button" className="linkbtn" onClick={abort}>
            Abbrechen
          </button>
        )}
      </header>

      {screen.name === 'start' && <StartScreen onStart={start} onTeacher={() => setScreen({ name: 'teacher' })} />}
      {screen.name === 'run' && <TaskRunner key={screen.session.id} tasks={tasksFor(screen.session.subjects)} onResponses={addResponses} onFinish={finish} />}
      {screen.name === 'finish' && (
        <FinishScreen child={screen.session.child} onHome={() => setScreen({ name: 'start' })} onTeacher={() => setScreen({ name: 'teacher', sessionId: screen.session.id })} />
      )}
      {screen.name === 'teacher' && (
        <ResultsScreen
          sessions={sessions}
          initialSessionId={screen.sessionId}
          onDelete={(id) => {
            deleteSession(id);
            setSessions(loadSessions());
          }}
          onHome={() => setScreen({ name: 'start' })}
        />
      )}
    </div>
  );
}
