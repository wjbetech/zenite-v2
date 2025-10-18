'use client';

import React from 'react';
import { createPortal } from 'react-dom';

export default function TooltipPortal({
  tooltip,
}: {
  tooltip: null | { x: number; y: number; node: React.ReactNode };
}) {
  if (!tooltip || typeof document === 'undefined') return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: tooltip.x,
        top: tooltip.y,
        transform: 'translate(-50%, -100%)',
        zIndex: 9999,
        pointerEvents: 'auto',
      }}
    >
      {tooltip.node}
    </div>,
    document.body,
  );
}
