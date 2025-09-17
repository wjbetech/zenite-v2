'use client';

import React from 'react';

type Item = { id: string } & Record<string, unknown>;

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
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const itemRefs = React.useRef(new Map<string, HTMLDivElement>());

  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const dragState = React.useRef({
    startY: 0,
    draggedHeight: 0,
    originalIndex: 0,
    placeholderIndex: 0,
    positions: [] as Array<{ id: string; top: number; height: number }>,
    pointerId: -1,
    capturedEl: null as Element | null,
  });

  // keep a stable original order when a drag starts
  const originalOrderRef = React.useRef<string[]>(items.map((i) => i.id));

  React.useEffect(() => {
    if (!draggingId) originalOrderRef.current = items.map((i) => i.id);
  }, [items, draggingId]);

  const measure = () => {
    const positions: Array<{ id: string; top: number; height: number }> = [];
    const contTop = containerRef.current?.getBoundingClientRect().top ?? 0;
    items.forEach((it) => {
      const el = itemRefs.current.get(it.id);
      if (!el) return;
      const r = el.getBoundingClientRect();
      // top relative to container's top in viewport coordinates
      positions.push({ id: it.id, top: r.top - contTop, height: r.height });
    });
    return positions;
  };

  // helper removed - logic is handled inline in pointer move

  const handlePointerDown = (e: React.PointerEvent, id: string, index: number) => {
    // only left click or touch
    if (e.button && e.button !== 0) return;
    // capture pointer on the element that has the listener so we continue to get move/up events
    try {
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      dragState.current.capturedEl = e.currentTarget as Element;
    } catch {}
    e.currentTarget.classList.add('dragging');
    const positions = measure();
    const el = itemRefs.current.get(id)!;
    dragState.current = {
      startY: e.clientY,
      draggedHeight: el.getBoundingClientRect().height,
      originalIndex: index,
      placeholderIndex: index,
      positions,
      pointerId: e.pointerId,
      capturedEl: dragState.current.capturedEl,
    };
    setDraggingId(id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId) return;
    e.preventDefault();
    const s = dragState.current;
    const delta = e.clientY - s.startY;
    // compute where the center of the dragged item would be
    const draggedCenter = s.positions[s.originalIndex].top + s.draggedHeight / 2 + delta;
    // find new placeholder index
    let newIndex = s.positions.length - 1;
    const HYSTERESIS = Math.min(12, s.draggedHeight * 0.15); // avoid tiny, jittery changes
    for (let i = 0; i < s.positions.length; i++) {
      const mid = s.positions[i].top + s.positions[i].height / 2;
      if (draggedCenter < mid - HYSTERESIS) {
        newIndex = i;
        break;
      }
    }
    if (newIndex !== s.placeholderIndex) {
      s.placeholderIndex = newIndex;
      // force update for transforms by toggling state
      // (no-op state) to trigger re-render
      setRenderKey((k) => k + 1);
    }
    // update dragged element transform directly for smoother follow
    const draggedEl = itemRefs.current.get(draggingId!);
    if (draggedEl) {
      draggedEl.style.transform = `translateY(${delta}px)`;
      draggedEl.style.zIndex = '60';
      draggedEl.style.transition = 'none';
      draggedEl.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
    }
    // set transforms for others via state render
  };

  const [renderKey, setRenderKey] = React.useState(0);

  const handlePointerUp = () => {
    if (!draggingId) return;
    const s = dragState.current;
    const to = s.placeholderIndex;
    const next = [...items];
    const movedIndex = next.findIndex((n) => n.id === draggingId);
    const [moved] = next.splice(movedIndex, 1);
    next.splice(to, 0, moved);
    // release pointer capture from the captured element (if any)
    try {
      if (s.capturedEl && s.pointerId && s.pointerId !== -1) {
        (s.capturedEl as Element).releasePointerCapture?.(s.pointerId as number);
      }
    } catch {}

    // clear styles/classes for all tracked item elements to avoid stuck state
    itemRefs.current.forEach((el) => {
      try {
        (el as HTMLElement).style.transform = '';
        (el as HTMLElement).style.zIndex = '';
        (el as HTMLElement).style.transition = '';
        (el as HTMLElement).style.boxShadow = '';
        el.classList.remove('dragging');
      } catch {}
    });

    // reset drag state and re-render
    setDraggingId(null);
    setRenderKey((k) => k + 1);
    onReorder(next);
  };

  React.useEffect(() => {
    const handlePointerUpWindow = () => handlePointerUp();
    window.addEventListener('pointerup', handlePointerUpWindow);
    return () => window.removeEventListener('pointerup', handlePointerUpWindow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // compute transforms for non-dragged items according to placeholder movement
  const getTransformFor = (id: string) => {
    if (!draggingId) return '';
    const s = dragState.current;
    const origIndex = s.positions.findIndex((p) => p.id === id);
    if (origIndex === -1) return '';
    const placeholder = s.placeholderIndex;
    const draggedIndex = s.originalIndex;
    if (id === draggingId) return '';
    // if dragged moved down (placeholder > draggedIndex), items between draggedIndex+1..placeholder shift up by draggedHeight
    if (placeholder > draggedIndex) {
      if (origIndex > draggedIndex && origIndex <= placeholder) {
        return `translateY(-${s.draggedHeight}px)`;
      }
    }
    // if dragged moved up (placeholder < draggedIndex), items between placeholder..draggedIndex-1 shift down
    if (placeholder < draggedIndex) {
      if (origIndex >= placeholder && origIndex < draggedIndex) {
        return `translateY(${s.draggedHeight}px)`;
      }
    }
    return '';
  };

  return (
    <div key={renderKey} ref={containerRef} className={containerClassName}>
      {items.map((it, idx) => {
        const isDragging = draggingId === it.id;
        const transform = getTransformFor(it.id);
        return (
          <div
            key={it.id}
            ref={(el) => {
              if (el) itemRefs.current.set(it.id, el);
              else itemRefs.current.delete(it.id);
            }}
            onPointerDown={(e) => handlePointerDown(e, it.id, idx)}
            onPointerMove={handlePointerMove}
            className="draggable-item"
            style={{
              transform: isDragging ? undefined : transform,
              transition: isDragging ? 'none' : 'transform 200ms ease',
              touchAction: 'none',
              cursor: 'grab',
            }}
          >
            {renderItem(it)}
          </div>
        );
      })}
    </div>
  );
}
