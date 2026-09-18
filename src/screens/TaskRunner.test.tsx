import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskRunner } from './TaskRunner';
import type { Response, Task } from '../types';

const tasks: Task[] = [
  {
    id: 'pm',
    subject: 'mathe',
    area: 'ma-rechenstrategien',
    title: 'Plus und Minus',
    instruction: 'Rechne.',
    items: [
      { id: 'a', kind: 'plus-minus', a: 3, op: '+', b: 4, options: [6, 7, 8, 5] },
      { id: 'b', kind: 'plus-minus', a: 9, op: '-', b: 5, options: [3, 5, 4, 6] },
    ],
  },
  {
    id: 'sy',
    subject: 'deutsch',
    area: 'de-phonologische-bewusstheit',
    title: 'Silben',
    instruction: 'Klatsche.',
    items: [{ id: 'c', kind: 'syllables', word: 'Panda', emoji: '🐼', answer: 2 }],
  },
];

describe('TaskRunner', () => {
  it('führt durch alle Aufgaben, protokolliert Antworten und meldet das Ende', async () => {
    const user = userEvent.setup();
    const responses: Response[] = [];
    const onFinish = vi.fn();
    render(<TaskRunner tasks={tasks} onResponses={(rs) => responses.push(...rs)} onFinish={onFinish} />);

    // Zwischenbildschirm der ersten Aufgabe
    expect(screen.getByRole('heading', { name: 'Plus und Minus' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Los geht’s' }));

    await user.click(screen.getByRole('button', { name: '7' })); // richtig
    await user.click(screen.getByRole('button', { name: '3' })); // falsch (Zählfehler −1)

    expect(screen.getByRole('heading', { name: 'Silben' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Los geht’s' }));
    await user.click(screen.getByRole('button', { name: '2 Mal klatschen' }));

    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(responses).toHaveLength(3);
    expect(responses[0]).toMatchObject({ taskId: 'pm', itemId: 'a', correct: true });
    expect(responses[1]).toMatchObject({ taskId: 'pm', itemId: 'b', correct: false, offByOne: true });
    expect(responses[2]).toMatchObject({ taskId: 'sy', itemId: 'c', correct: true });
    expect(responses.every((r) => typeof r.ms === 'number')).toBe(true);
  });

  it('bricht zeitbegrenzte Aufgaben nach Ablauf ab und markiert Rest-Items', async () => {
    vi.useFakeTimers();
    try {
      const timed: Task[] = [
        {
          id: 'lg',
          subject: 'deutsch',
          area: 'de-lesefluessigkeit',
          title: 'Tierwörter',
          instruction: 'Tier?',
          timeLimitMs: 2000,
          items: [
            { id: 'w1', kind: 'animal-word', word: 'Hund', isAnimal: true },
            { id: 'w2', kind: 'animal-word', word: 'Tisch', isAnimal: false },
            { id: 'w3', kind: 'animal-word', word: 'Katze', isAnimal: true },
          ],
        },
      ];
      const responses: Response[] = [];
      const onFinish = vi.fn();
      render(<TaskRunner tasks={timed} onResponses={(rs) => responses.push(...rs)} onFinish={onFinish} />);

      // fireEvent statt userEvent: userEvent wartet intern auf echte Timer.
      fireEvent.click(screen.getByRole('button', { name: 'Los geht’s' }));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });
      fireEvent.click(screen.getByRole('button', { name: 'Ja' }));
      expect(responses).toHaveLength(1);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(2500);
      });

      expect(onFinish).toHaveBeenCalledTimes(1);
      expect(responses).toHaveLength(3);
      expect(responses[1]).toMatchObject({ itemId: 'w2', timedOut: true });
      expect(responses[2]).toMatchObject({ itemId: 'w3', timedOut: true });
    } finally {
      vi.useRealTimers();
    }
  });
});
