/* eslint-disable @typescript-eslint/no-explicit-any */
// Minimal ambient module declarations to satisfy TypeScript when `@dnd-kit` types aren't installed
declare module '@dnd-kit/core' {
  export const DndContext: any;
  export type DragEndEvent = any;
  export const useSensor: any;
  export const useSensors: any;
  export const PointerSensor: any;
  export const closestCenter: any;
}

declare module '@dnd-kit/sortable' {
  export const SortableContext: any;
  export const arrayMove: any;
  export const useSortable: any;
  export const verticalListSortingStrategy: any;
}

declare module '@dnd-kit/utilities' {
  export const CSS: any;
}
