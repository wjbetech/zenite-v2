import mergeReorderedSubset from '../task-reorder';

type Item = { id: string; value: number };

describe('mergeReorderedSubset', () => {
  const all: Item[] = [
    { id: 'a', value: 1 },
    { id: 'b', value: 2 },
    { id: 'c', value: 3 },
    { id: 'd', value: 4 },
    { id: 'e', value: 5 },
  ];

  test('merges reordered subset back into original positions', () => {
    const idOrder = ['c', 'a', 'e'];
    const merged = mergeReorderedSubset(all, idOrder);
    // Positions for the subset within `all` are [0,2,4]. They will be
    // filled in that order with the reordered items ['c','a','e'].
    expect(merged[0].id).toBe('c');
    expect(merged[2].id).toBe('a');
    expect(merged[4].id).toBe('e');
  });

  test('ignores ids not present in all', () => {
    const idOrder = ['x', 'b', 'd'];
    const merged = mergeReorderedSubset(all, idOrder);
    // 'x' should be ignored; b,d should be placed in their original spots in the order they appear in idOrder
    expect(merged[1].id).toBe('b');
    expect(merged[3].id).toBe('d');
  });

  test('empty idOrder returns original array', () => {
    const merged = mergeReorderedSubset(all, []);
    expect(merged).toEqual(all);
  });
});
