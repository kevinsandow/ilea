import { ALL_TASKS, AREAS, tasksFor } from './index';
import { relationOf } from '../tasks/common';

describe('Aufgabenpakete', () => {
  it('haben eindeutige Aufgaben- und Item-IDs', () => {
    const taskIds = ALL_TASKS.map((t) => t.id);
    expect(new Set(taskIds).size).toBe(taskIds.length);
    const itemIds = ALL_TASKS.flatMap((t) => t.items.map((i) => `${t.id}/${i.id}`));
    expect(new Set(itemIds).size).toBe(itemIds.length);
  });

  it('verweisen auf existierende Kompetenzbereiche des richtigen Fachs', () => {
    for (const t of ALL_TASKS) {
      expect(AREAS[t.area]).toBeDefined();
      expect(AREAS[t.area].subject).toBe(t.subject);
    }
  });

  it('haben mindestens ein Item und eine Anweisung', () => {
    for (const t of ALL_TASKS) {
      expect(t.items.length).toBeGreaterThan(0);
      expect(t.instruction.length).toBeGreaterThan(5);
    }
  });

  it('filtert nach Fach', () => {
    expect(tasksFor(['mathe']).every((t) => t.subject === 'mathe')).toBe(true);
    expect(tasksFor(['deutsch']).every((t) => t.subject === 'deutsch')).toBe(true);
    expect(tasksFor(['deutsch', 'mathe'])).toHaveLength(ALL_TASKS.length);
  });

  it('enthält konsistente Lösungen', () => {
    for (const t of ALL_TASKS) {
      for (const item of t.items) {
        switch (item.kind) {
          case 'number-grasp':
            expect(item.blocks.tens * 10 + item.blocks.ones).toBe(item.answer);
            break;
          case 'compare-quantities':
            expect(relationOf(item.left.tens * 10 + item.left.ones, item.right.tens * 10 + item.right.ones)).toBe(item.answer);
            break;
          case 'quick-see':
            expect(item.display.count).toBe(item.answer);
            break;
          case 'plus-minus': {
            const result = item.op === '+' ? item.a + item.b : item.a - item.b;
            expect(item.options).toContain(result);
            expect(new Set(item.options).size).toBe(item.options.length);
            break;
          }
          case 'decompose':
            expect(item.given).toBeLessThan(item.total);
            break;
          case 'gap-sentence':
            expect(item.options).toContain(item.answer);
            expect(item.options).toHaveLength(4);
            break;
          case 'book-cover':
            expect(item.covers[item.answer]).toBeDefined();
            expect(item.covers).toHaveLength(4);
            break;
          case 'sentence-match':
            expect(item.pairs).toHaveLength(3);
            break;
          case 'syllables':
            expect(item.answer).toBeGreaterThanOrEqual(1);
            expect(item.answer).toBeLessThanOrEqual(4);
            break;
          case 'compare-spoken':
            expect(item.a).not.toBe(item.b);
            break;
          default:
            break;
        }
      }
    }
  });
});
