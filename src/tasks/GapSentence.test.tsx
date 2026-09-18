import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GapSentence } from './GapSentence';
import type { ItemOf, Task } from '../types';

const item: ItemOf<'gap-sentence'> = {
  id: 'g1',
  kind: 'gap-sentence',
  before: 'Der Hund',
  after: 'laut.',
  options: ['bellt', 'Bett', 'Ball', 'bald'],
  answer: 'bellt',
};
const task: Task = { id: 't', subject: 'deutsch', area: 'de-leseverstaendnis', title: 'Lückensätze', instruction: 'Welches Wort passt?', items: [item] };

describe('GapSentence', () => {
  it('OK ist erst nach einer Auswahl aktiv und meldet das Ergebnis', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<GapSentence task={task} item={item} first={false} onAnswer={onAnswer} />);

    const ok = screen.getByRole('button', { name: 'OK' });
    expect(ok).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: 'Bett' }));
    expect(ok).toBeEnabled();
    await user.click(ok);

    expect(onAnswer).toHaveBeenCalledWith(expect.objectContaining({ given: 'Bett', correct: false, points: 0 }));
  });

  it('meldet „?“ als unbekannt', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<GapSentence task={task} item={item} first={false} onAnswer={onAnswer} />);
    await user.click(screen.getByRole('button', { name: 'Ich weiß es nicht' }));
    expect(onAnswer).toHaveBeenCalledWith(expect.objectContaining({ unknown: true, correct: false }));
  });
});
