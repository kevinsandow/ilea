import { useEffect, useMemo, useRef, useState } from 'react';
import { speak, stopSpeaking } from '../audio/speech';
import { Character } from '../components/Characters';
import { ProgressBar } from '../components/ProgressBar';
import { ItemView } from '../tasks';
import type { ItemResult, Response, Task } from '../types';

interface Props {
  tasks: Task[];
  onResponses: (rs: Response[]) => void;
  onFinish: () => void;
}

const PRAISE = ['Weiter so!', 'Prima!', 'Das machst du gut!', 'Super!', 'Toll gemacht!', 'Klasse!'];

type Phase = 'intro' | 'items';

/**
 * Führt durch alle Aufgaben: Zwischenbildschirm mit Leo/Lea → Items → nächste Aufgabe.
 * Misst Bearbeitungszeit je Item und setzt das Zeitlimit zeitbegrenzter Aufgaben um.
 */
export function TaskRunner({ tasks, onResponses, onFinish }: Props) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [secondsLeft, setSecondsLeft] = useState<number | undefined>(undefined);
  const itemStart = useRef(0);
  const expireRef = useRef<() => void>(() => {});

  const task = tasks[taskIndex];
  const item = task?.items[itemIndex];
  const who = task?.subject === 'mathe' ? 'leo' : 'lea';
  const praise = useMemo(() => PRAISE[(taskIndex * 7 + itemIndex) % PRAISE.length], [taskIndex, itemIndex]);

  const gotoNextTask = () => {
    stopSpeaking();
    if (taskIndex + 1 >= tasks.length) {
      onFinish();
      return;
    }
    setTaskIndex((i) => i + 1);
    setItemIndex(0);
    setPhase('intro');
  };

  // Zeit abgelaufen: verbleibende Items als nicht bearbeitet protokollieren, dann weiter.
  useEffect(() => {
    expireRef.current = () => {
      if (!task) return;
      const rest = task.items.slice(itemIndex).map<Response>((it) => ({
        taskId: task.id,
        itemId: it.id,
        given: '',
        correct: false,
        points: 0,
        maxPoints: 1,
        ms: 0,
        timedOut: true,
      }));
      onResponses(rest);
      gotoNextTask();
    };
  });

  // Zeitlimit (z. B. Lesegeschwindigkeit): Countdown läuft ab dem ersten Item der Aufgabe.
  useEffect(() => {
    if (phase !== 'items' || !task?.timeLimitMs) return;
    const limit = task.timeLimitMs;
    const start = performance.now();
    let iv = 0;
    const tick = () => {
      const left = Math.max(0, Math.ceil((limit - (performance.now() - start)) / 1000));
      setSecondsLeft(left);
      if (left === 0) {
        window.clearInterval(iv);
        expireRef.current();
      }
    };
    const t0 = window.setTimeout(tick, 0);
    iv = window.setInterval(tick, 250);
    return () => {
      window.clearTimeout(t0);
      window.clearInterval(iv);
    };
  }, [phase, task]);

  if (!task || !item) return null;

  const handleAnswer = (r: ItemResult) => {
    const ms = Math.round(performance.now() - itemStart.current);
    onResponses([{ ...r, taskId: task.id, itemId: item.id, ms }]);
    itemStart.current = performance.now();
    if (itemIndex + 1 < task.items.length) {
      setItemIndex((i) => i + 1);
    } else {
      gotoNextTask();
    }
  };

  const startItems = () => {
    stopSpeaking();
    itemStart.current = performance.now();
    setPhase('items');
  };

  const introText = `${taskIndex === 0 ? 'Los geht’s!' : praise} Jetzt kommt: ${task.title}.`;

  return (
    <>
      <ProgressBar total={tasks.length} current={taskIndex} label={`${task.title} · ${itemIndex + 1}/${task.items.length}`} />
      <div className="stage">
        <aside className="stage__side" aria-hidden="true">
          <div className="bubble">{phase === 'intro' ? introText : praise}</div>
          <Character who={who} size={130} />
        </aside>
        {phase === 'intro' ? (
          <IntroCard key={task.id} text={introText} title={task.title} instruction={task.instruction} onStart={startItems} />
        ) : (
          <ItemView
            key={`${task.id}-${item.id}`}
            task={task}
            item={item}
            first={itemIndex === 0}
            onAnswer={handleAnswer}
            secondsLeft={task.timeLimitMs ? secondsLeft : undefined}
          />
        )}
      </div>
    </>
  );
}

function IntroCard({ text, title, instruction, onStart }: { text: string; title: string; instruction: string; onStart: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(() => speak(text), 300);
    return () => window.clearTimeout(t);
  }, [text]);

  return (
    <section className="card" style={{ alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
      <p className="muted" style={{ margin: 0 }}>
        Nächste Aufgabe
      </p>
      <h2 style={{ margin: 0, fontSize: 34 }}>{title}</h2>
      <p style={{ maxWidth: 520, fontSize: 20 }}>{instruction}</p>
      <button type="button" className="bigbtn" onClick={onStart} autoFocus>
        Los geht’s
      </button>
    </section>
  );
}
