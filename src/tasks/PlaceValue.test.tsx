import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlaceValue } from './PlaceValue';
import type { ItemOf, Task } from '../types';

const item: ItemOf<'place-value'> = { id: 'p1', kind: 'place-value', number: 47 };
const task: Task = { id: 't', subject: 'mathe', area: 'ma-zahlen-auffassen', title: 'Stellenwerttafel', instruction: 'Trage die Zahl ein.', items: [item] };

describe('PlaceValue', () => {
  it('zeigt das Zahlwort ohne Sprachausgabe an und wertet Z/E aus', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<PlaceValue task={task} item={item} onAnswer={onAnswer} />);

    // jsdom hat keine speechSynthesis → Fallback-Text
    expect(screen.getByText('siebenundvierzig')).toBeInTheDocument();

    // Aktive Spalte ist Z; nach der ersten Ziffer springt der Fokus auf E.
    const pad = screen.getByRole('group', { name: 'Ziffernblock' });
    await user.click(pad.querySelector('button:nth-child(4)')!); // 4
    await user.click(pad.querySelector('button:nth-child(7)')!); // 7
    await user.click(screen.getByRole('button', { name: 'OK' }));

    expect(onAnswer).toHaveBeenCalledWith(expect.objectContaining({ correct: true, given: 'H:– Z:4 E:7' }));
  });
});
