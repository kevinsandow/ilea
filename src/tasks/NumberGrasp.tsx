import { BaseTenBlocks } from '../components/BaseTenBlocks';
import type { ItemOf, ItemResult, Task } from '../types';
import { NumericTask } from './NumericTask';

interface Props {
  task: Task;
  item: ItemOf<'number-grasp'>;
  first: boolean;
  onAnswer: (r: ItemResult) => void;
}

export function NumberGrasp({ task, item, first, onAnswer }: Props) {
  return (
    <NumericTask instruction={task.instruction} hint={task.hint} autoPlay={first} answer={item.answer} onAnswer={onAnswer}>
      <BaseTenBlocks tens={item.blocks.tens} ones={item.blocks.ones} label="Zehnersystem-Material" />
    </NumericTask>
  );
}
