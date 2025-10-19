import { useCallback, useEffect, useRef, useState } from 'react';

export default function useScrollableTabs(tabsRef: React.RefObject<HTMLElement | null>) {
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);
  const didDrag = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = tabsRef.current as HTMLElement | null;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, [tabsRef]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const el = tabsRef.current as HTMLElement | null;
      if (!el) return;
      isDragging.current = true;
      dragStartX.current = e.clientX;
      scrollStartX.current = el.scrollLeft;
      didDrag.current = false;
      try {
        (e.target as Element).setPointerCapture(e.pointerId);
      } catch {}
    },
    [tabsRef],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current || !tabsRef.current) return;
      const dx = e.clientX - dragStartX.current;
      if (Math.abs(dx) > 6) didDrag.current = true;
      tabsRef.current.scrollLeft = scrollStartX.current - dx;
      updateScrollButtons();
    },
    [tabsRef, updateScrollButtons],
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    isDragging.current = false;
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {}
  }, []);

  const scrollTabsBy = useCallback(
    (amount: number) => {
      const el = tabsRef.current as HTMLElement | null;
      if (!el) return;
      el.scrollBy({ left: amount, behavior: 'smooth' });
      setTimeout(updateScrollButtons, 250);
    },
    [tabsRef, updateScrollButtons],
  );

  useEffect(() => {
    updateScrollButtons();
    const handleResize = () => updateScrollButtons();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateScrollButtons]);

  const onScroll = useCallback(() => {
    updateScrollButtons();
  }, [updateScrollButtons]);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onScroll,
    scrollTabsBy,
    canScrollLeft,
    canScrollRight,
    // expose the didDrag ref so callers can prevent click-through after dragging
    didDrag,
  } as const;
}
