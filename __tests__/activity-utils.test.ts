import { buildActivityFrom, PersistedActivity, TaskLike } from '../src/lib/activityUtils';

describe('buildActivityFrom', () => {
  test('deduplicates persisted titles and live completions by id', () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = `${today.getMonth() + 1}`.padStart(2, '0');
    const d = `${today.getDate()}`.padStart(2, '0');
    const key = `${y}-${m}-${d}`;

    const persisted: PersistedActivity = {
      [key]: { count: 2, titles: ['A', 'A'] },
    };

    const storeTasks: TaskLike[] = [
      { id: 't1', title: 'A', completed: true, completedAt: key },
      { id: 't1', title: 'A', completed: true, completedAt: key },
      { id: 't2', title: 'B', completed: true, completedAt: key },
    ];

    const { activityMap, activityDetails } = buildActivityFrom(persisted, storeTasks);
    expect(activityMap[key]).toBe(2);
    expect(activityDetails[key].sort()).toEqual(['A', 'B'].sort());
  });
});
