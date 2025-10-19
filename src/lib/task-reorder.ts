export function mergeReorderedSubset<T extends { id: string }>(all: T[], idOrder: string[]): T[] {
  // Map ids to items in the order provided by idOrder
  const reordered = idOrder.map((id) => all.find((t) => t.id === id)).filter(Boolean) as T[];
  // Find original positions of the subset within the global list
  const positions: number[] = [];
  const idSet = new Set(idOrder);
  all.forEach((t, idx) => {
    if (idSet.has(t.id)) positions.push(idx);
  });

  // Place reordered items back into their original indices
  const merged = [...all];
  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    merged[pos] = reordered[i] || merged[pos];
  }
  return merged;
}

export default mergeReorderedSubset;
