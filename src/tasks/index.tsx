import type { Item, ItemResult, Task } from '../types';
import { AnimalWord } from './AnimalWord';
import { BookCover } from './BookCover';
import { ClickQuantity } from './ClickQuantity';
import { CompareQuantities } from './CompareQuantities';
import { CompareSpoken } from './CompareSpoken';
import { Context } from './Context';
import { Decompose } from './Decompose';
import { GapSentence } from './GapSentence';
import { NumberGrasp } from './NumberGrasp';
import { PlaceValue } from './PlaceValue';
import { PlusMinus } from './PlusMinus';
import { QuickSee } from './QuickSee';
import { SentenceMatch } from './SentenceMatch';
import { SpellWord } from './SpellWord';
import { Syllables } from './Syllables';

export interface ItemViewProps {
  task: Task;
  item: Item;
  /** Erstes Item der Aufgabe – dann wird die Anweisung automatisch vorgelesen. */
  first: boolean;
  onAnswer: (r: ItemResult) => void;
  secondsLeft?: number;
}

/** Wählt die passende View-Komponente anhand von `item.kind`. */
export function ItemView({ task, item, first, onAnswer, secondsLeft }: ItemViewProps) {
  switch (item.kind) {
    case 'quick-see':
      return <QuickSee task={task} item={item} first={first} onAnswer={onAnswer} />;
    case 'number-grasp':
      return <NumberGrasp task={task} item={item} first={first} onAnswer={onAnswer} />;
    case 'click-quantity':
      return <ClickQuantity task={task} item={item} first={first} onAnswer={onAnswer} />;
    case 'compare-quantities':
      return <CompareQuantities task={task} item={item} first={first} onAnswer={onAnswer} />;
    case 'compare-spoken':
      return <CompareSpoken task={task} item={item} onAnswer={onAnswer} />;
    case 'decompose':
      return <Decompose task={task} item={item} first={first} onAnswer={onAnswer} />;
    case 'context':
      return <Context task={task} item={item} onAnswer={onAnswer} />;
    case 'plus-minus':
      return <PlusMinus task={task} item={item} first={first} onAnswer={onAnswer} />;
    case 'place-value':
      return <PlaceValue task={task} item={item} onAnswer={onAnswer} />;
    case 'animal-word':
      return <AnimalWord task={task} item={item} first={first} onAnswer={onAnswer} secondsLeft={secondsLeft} />;
    case 'gap-sentence':
      return <GapSentence task={task} item={item} first={first} onAnswer={onAnswer} />;
    case 'sentence-match':
      return <SentenceMatch task={task} item={item} first={first} onAnswer={onAnswer} />;
    case 'book-cover':
      return <BookCover task={task} item={item} onAnswer={onAnswer} />;
    case 'spell-word':
      return <SpellWord task={task} item={item} first={first} onAnswer={onAnswer} />;
    case 'syllables':
      return <Syllables task={task} item={item} first={first} onAnswer={onAnswer} />;
  }
}
