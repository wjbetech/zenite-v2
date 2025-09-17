'use client';

import React from 'react';

type Item = { id: string } & Record<string, any>;

type Props<T extends Item> = {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T) => React.ReactNode;
  containerClassName?: string;
};

export default function NativeSortableDaily<T extends Item>({
  items,
  onReorder,
  renderItem,
  containerClassName,
}: Props<T>) {
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setDragIndex(null);
  }, [items]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    // set dataTransfer so the drag is allowed
    try {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', items[index].id);
    } catch {}
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.currentTarget as HTMLElement;
    target.classList.add('opacity-80');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('opacity-80');
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    const fromIndex = items.findIndex((i) => i.id === draggedId);
    if (fromIndex === -1) return;
    if (fromIndex === index) return;
    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(index, 0, moved);
    onReorder(next);
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('opacity-80');
    setDragIndex(null);
  };

  return (
    <div ref={listRef} className={containerClassName}>
      {items.map((it, idx) => (
        <div
          key={it.id}
          draggable
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, idx)}
          className="draggable-item"
        >
          {renderItem(it)}
        </div>
      ))}
    </div>
  );
}
