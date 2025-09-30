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
  const [dragTop, setDragTop] = React.useState<number>(0);
  const [dragHeight, setDragHeight] = React.useState<number>(0);
  const [, setTick] = React.useState(0);

  const dragState = React.useRef<{
    startY: number;
    initialTop: number;
    originalIndex: number;
    placeholderIndex: number;
    pointerId: number;
    capturedEl: Element | null;
    lastDrop: number;
    // optional pending-state fields
    pending?: boolean;
    candidateEl?: Element | null;
    startX?: number;
    // startY already declared above; kept for active drag
    pendingIndex?: number;
  }>({
    startY: 0,
    initialTop: 0,
    originalIndex: 0,
    placeholderIndex: 0,
    pointerId: -1,
    capturedEl: null,
    lastDrop: 0,
  });
  const windowMoveRef = React.useRef<((e: PointerEvent) => void) | null>(null);
  const rafRef = React.useRef<number | null>(null);

  // Helper: cleanup a pending drag state (can be called from different places)
  const cleanupPending = () => {
    try {
      if (
        dragState.current.capturedEl &&
        dragState.current.pointerId &&
        dragState.current.pointerId !== -1
      ) {
        dragState.current.capturedEl.releasePointerCapture?.(dragState.current.pointerId as number);
      }
    } catch {}
    dragState.current.pending = false;
    dragState.current.pointerId = -1;
    dragState.current.candidateEl = null;
    dragState.current.startX = 0;
    dragState.current.startY = 0;
    dragState.current.pendingIndex = -1;
    window.removeEventListener('pointermove', handlePendingMove, true);
    window.removeEventListener('pointerup', handlePendingUp, true);
  };

  // Promote a pending drag into an active drag using values stored on dragState.current
  const promoteToDrag = () => {
    window.removeEventListener('pointermove', handlePendingMove, true);
    window.removeEventListener('pointerup', handlePendingUp, true);
    dragState.current.pending = false;

    const pointerId = dragState.current.pointerId as number;
    const candidateEl = dragState.current.candidateEl as Element;
    const pendingIdx = dragState.current.pendingIndex ?? 0;
    const id = items[pendingIdx]?.id;
    const el = id ? itemRefs.current.get(id) : null;
    try {
      candidateEl?.setPointerCapture?.(pointerId as number);
      dragState.current.capturedEl = candidateEl;
    } catch {}
    const contTop = containerRef.current?.getBoundingClientRect().top ?? 0;
    const rect = el?.getBoundingClientRect();
    const startY = dragState.current.startY ?? 0;
    dragState.current.startY = startY;
    dragState.current.initialTop = rect ? rect.top - contTop : 0;
    dragState.current.originalIndex = pendingIdx;
    dragState.current.placeholderIndex = pendingIdx;
    dragState.current.pointerId = pointerId;
    dragState.current.lastDrop = dragState.current.lastDrop || 0;

    setDragTop(rect ? rect.top - contTop : 0);
    setDragHeight(rect ? rect.height : 0);
    if (id) setDraggingId(id);
    setTick((k: number) => k + 1);

    // attach the active global pointermove handler used during a drag
    const onWindowMove = (moveEvent: PointerEvent) => {
      try {
        moveEvent.preventDefault?.();
      } catch {}
      const s = dragState.current;
      if (!s) return;
      if (typeof moveEvent.buttons === 'number' && moveEvent.buttons === 0) {
        finishDrag();
        return;
      }
      const delta = moveEvent.clientY - s.startY;
      const top = s.initialTop + delta;
      setDragTop(top);

      if (!cachedMidpoints.current) recomputeCachedMidpoints();
      const mids = cachedMidpoints.current || [];
      const center = top + dragHeight / 2;
      let lo = 0;
      let hi = mids.length;
      while (lo < hi) {
        const m = Math.floor((lo + hi) / 2);
        if (center < mids[m].mid) hi = m;
        else lo = m + 1;
      }
      const newIndex = Math.max(0, Math.min(mids.length, lo));
      if (newIndex !== s.placeholderIndex) {
        s.placeholderIndex = newIndex;
        setTick((k: number) => k + 1);
      }
    };
    windowMoveRef.current = onWindowMove;
    window.addEventListener('pointermove', onWindowMove, { passive: false });
    recomputeCachedMidpoints();
    window.addEventListener('resize', recomputeCachedMidpoints, true);
    window.addEventListener('scroll', recomputeCachedMidpoints, true);
  };

  const handlePendingMove = (we: PointerEvent) => {
    // If no buttons are pressed, cancel pending (user likely lifted finger).
    if (typeof we.buttons === 'number' && we.buttons === 0) {
      cleanupPending();
      return;
    }
    const startX = dragState.current.startX ?? 0;
    const startY = dragState.current.startY ?? 0;
    const dx = we.clientX - startX;
    const dy = we.clientY - startY;
    const threshold = 6;
    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      // promote to active drag
      promoteToDrag();
    }
  };

  const handlePendingUp = () => {
    // user released before threshold — cancel pending and allow click
    cleanupPending();
  };

  // measurePositions removed: we now use cachedMidpoints and DOM reads only on drag start/resize/scroll

  // Cached midpoints used during an active drag to avoid recomputing DOM
  // measurements on every pointer move which can cause jumps and skipped items.
  const cachedMidpoints = React.useRef<{ id: string; mid: number }[] | null>(null);

  const recomputeCachedMidpoints = () => {
    const contTop = containerRef.current?.getBoundingClientRect().top ?? 0;
    const list = draggingId ? items.filter((it) => it.id !== draggingId) : items;
    cachedMidpoints.current = list.map((it) => {
      const el = itemRefs.current.get(it.id);
      const r = el?.getBoundingClientRect();
      const top = r ? r.top - contTop : 0;
      const height = r ? r.height : 0;
      return { id: it.id, mid: top + height / 2 };
    });
  };

  // Helper: decide whether a pointerdown should be ignored (interactive element)
  const shouldIgnorePointerDown = (e: React.PointerEvent) => {
    if (e.button && e.button !== 0) return true;
    const tgt = e.target as Element | null;
    if (tgt && tgt.closest && tgt.closest('button,a,input,textarea,select,[role="button"]')) {
      return true;
    }
    if (draggingId) return true;
    const now = Date.now();
    if (dragState.current.lastDrop && now - dragState.current.lastDrop < 200) return true;
    return false;
  };

  // Helper: start a pending drag — extracts the state setup and listener registration
  const startPendingDrag = (
    id: string,
    index: number,
    candidateEl: Element,
    startX: number,
    startY: number,
    pointerId: number,
  ) => {
    dragState.current.pending = true;
    dragState.current.pointerId = pointerId;
    dragState.current.candidateEl = candidateEl;
    dragState.current.startX = startX;
    dragState.current.startY = startY;
    dragState.current.pendingIndex = index;

    // attach pending listeners (use capture so we see them early)
    window.addEventListener('pointermove', handlePendingMove, true);
    window.addEventListener('pointerup', handlePendingUp, true);
  };

  const computePlaceholderIndex = (top: number) => {
    if (!cachedMidpoints.current) recomputeCachedMidpoints();
    const mids = cachedMidpoints.current || [];
    const center = top + dragHeight / 2;
    let lo = 0;
    let hi = mids.length;
    while (lo < hi) {
      const m = Math.floor((lo + hi) / 2);
      if (center < mids[m].mid) hi = m;
      else lo = m + 1;
    }
    return Math.max(0, Math.min(mids.length, lo));
  };

  // we use a placeholder element to hold layout space while dragging;
  // cachedMidpoints are used for fast index calculation

  const handlePointerDown = (e: React.PointerEvent, id: string, index: number) => {
    if (shouldIgnorePointerDown(e)) return;
    const el = itemRefs.current.get(id);
    if (!el) return;

    // Start a "pending" drag. We do NOT set pointer capture or mutate DOM yet.
    // If the pointer moves beyond a small threshold, we promote to a real
    // drag; if the pointer is released before that, we cancel and allow a
    // normal click to proceed.
    const startX = e.clientX;
    const startY = e.clientY;
    const pointerId = e.pointerId;
    const candidateEl = e.currentTarget as Element;
    startPendingDrag(id, index, candidateEl, startX, startY, pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId) return;
    e.preventDefault();
    const s = dragState.current;
    if (!s) return;
    try {
      if (typeof e.buttons === 'number' && e.buttons === 0) {
        finishDrag();
        return;
      }
    } catch {}
    const delta = e.clientY - s.startY;
    const top = s.initialTop + delta;
    setDragTop(top);
    const newIndex = computePlaceholderIndex(top);
    if (newIndex !== s.placeholderIndex) {
      s.placeholderIndex = newIndex;
      setTick((k: number) => k + 1);
    }
  };

  const finishDrag = () => {
    if (!draggingId) return;
    console.debug('[NativeSortableDaily] finishDrag start', {
      draggingId,
      placeholder: dragState.current.placeholderIndex,
    });
    const s = dragState.current;
    const to = s.placeholderIndex;
    // cancel any pending rAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // Build the new ordering by removing the dragged id then inserting it at
    // the placeholder index. Map IDs back to item objects and filter out any
    // missing entries to avoid throwing during debug logging.
    const draggedId = draggingId as string;
    const idList = items.map((it) => it.id);
    const withoutId = idList.filter((x) => x !== draggedId);
    const insertAt = Math.max(0, Math.min(to, withoutId.length));
    const newIdOrder = [...withoutId];
    newIdOrder.splice(insertAt, 0, draggedId);
    const next = newIdOrder.map((id) => items.find((it) => it.id === id));
    const nextFiltered = next.filter(Boolean) as T[];

    // release pointer capture
    try {
      if (s.capturedEl && s.pointerId && s.pointerId !== -1) {
        (s.capturedEl as Element).releasePointerCapture?.(s.pointerId as number);
      }
    } catch {}
    // record drop time and clear pointer info
    dragState.current.lastDrop = Date.now();
    dragState.current.pointerId = -1;
    dragState.current.capturedEl = null;

    // remove global pointermove listener if attached
    if (windowMoveRef.current) {
      window.removeEventListener('pointermove', windowMoveRef.current);
      windowMoveRef.current = null;
    }

    // cleanup cached midpoints and layout listeners
    cachedMidpoints.current = null;
    window.removeEventListener('resize', recomputeCachedMidpoints, true);
    window.removeEventListener('scroll', recomputeCachedMidpoints, true);

    setDraggingId(null);
    setTick((k: number) => k + 1);
    console.debug(
      '[NativeSortableDaily] onReorder next order',
      nextFiltered.map((n) => n.id),
    );
    try {
      onReorder(nextFiltered);
    } catch (err) {
      console.error('[NativeSortableDaily] onReorder threw', err);
    }
  };

  React.useEffect(() => {
    const onUp = () => finishDrag();
    const onCancel = () => finishDrag();
    // use capture so these fire even if events would be stopped by children
    window.addEventListener('pointerup', onUp, true);
    window.addEventListener('pointercancel', onCancel, true);
    // add additional fallbacks for mouse and touch end events
    window.addEventListener('mouseup', onUp, true);
    window.addEventListener('touchend', onUp, true);
    return () => {
      window.removeEventListener('pointerup', onUp, true);
      window.removeEventListener('pointercancel', onCancel, true);
      window.removeEventListener('mouseup', onUp, true);
      window.removeEventListener('touchend', onUp, true);
      // ensure global pointermove is removed if still attached
      if (windowMoveRef.current) {
        window.removeEventListener('pointermove', windowMoveRef.current);
        windowMoveRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Render list with dragged item removed and placeholder inserted
  const renderList = () => {
    const s = dragState.current;
    const arr: React.ReactNode[] = [];
    const without = items.filter((it) => it.id !== draggingId);
    // placeholderIndex is tracked in dragState.current; offsets are applied via offsetsRef

    // Insert the placeholder at the current placeholderIndex so it follows
    // the pointer and visually indicates the drop target. This prevents
    // sudden layout jumps because the placeholder always occupies a slot.
    const placeholderIndex = draggingId ? s.placeholderIndex : -1;
    for (let i = 0; i <= without.length; i++) {
      if (i === placeholderIndex) {
        arr.push(
          <div
            key={`placeholder-${i}`}
            // collapse immediately when removed so slotting is instant
            style={{ height: dragHeight, transition: 'none' }}
            className="bg-transparent"
          />,
        );
      }
      if (i < without.length) {
        const it = without[i];
        arr.push(
          <div
            key={it.id}
            ref={(el) => {
              if (el) itemRefs.current.set(it.id, el);
              else itemRefs.current.delete(it.id);
            }}
            onPointerDown={(e) =>
              handlePointerDown(
                e,
                it.id,
                items.findIndex((x) => x.id === it.id),
              )
            }
            onPointerMove={handlePointerMove}
            className="select-none"
          >
            {renderItem(it)}
          </div>,
        );
      }
    }
    return arr;
  };

  return (
    <div ref={containerRef} className={containerClassName} style={{ position: 'relative' }}>
      {renderList()}
      {draggingId && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: dragTop,
            zIndex: 80,
            pointerEvents: 'none',
            transition: 'none',
          }}
        >
          <div style={{ width: '100%', height: dragHeight }} className="shadow-lg rounded-md">
            {renderItem(items.find((i) => i.id === draggingId) as T)}
          </div>
        </div>
      )}
    </div>
  );
}
