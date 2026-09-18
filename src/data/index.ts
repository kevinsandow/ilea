import type { Subject, Task } from '../types';
import { DEUTSCH_TASKS } from './deutsch';
import { MATHE_TASKS } from './mathe';

export { AREAS } from './areas';

export const ALL_TASKS: Task[] = [...DEUTSCH_TASKS, ...MATHE_TASKS];

export function tasksFor(subjects: Subject[]): Task[] {
  return ALL_TASKS.filter((t) => subjects.includes(t.subject));
}

export function findTask(id: string): Task | undefined {
  return ALL_TASKS.find((t) => t.id === id);
}
