declare module '@testing-library/react' {
  export function render(...args: unknown[]): {
    rerender: (ui: unknown) => void;
    unmount: () => void;
  };

  export const screen: {
    getByRole: (...args: unknown[]) => HTMLElement;
    getAllByRole: (...args: unknown[]) => HTMLElement[];
    getByText: (...args: unknown[]) => HTMLElement;
    queryByText: (...args: unknown[]) => HTMLElement | null;
    findByLabelText: (...args: unknown[]) => Promise<HTMLElement>;
    findByText: (...args: unknown[]) => Promise<HTMLElement>;
    getByAltText: (...args: unknown[]) => HTMLElement;
    getByLabelText: (...args: unknown[]) => HTMLElement;
    findByRole: (...args: unknown[]) => Promise<HTMLElement>;
    queryByRole: (...args: unknown[]) => HTMLElement | null;
  };

  export const fireEvent: { [k: string]: (...args: unknown[]) => void };

  export function within(node: unknown): {
    getByRole: (...args: unknown[]) => HTMLElement;
    getAllByRole: (...args: unknown[]) => HTMLElement[];
    getByText: (...args: unknown[]) => HTMLElement;
    getByLabelText: (...args: unknown[]) => HTMLElement;
  };

  export function waitFor(cb: () => unknown, options?: { timeout?: number }): Promise<unknown>;

  export function cleanup(): void;

  const _default: unknown;
  export default _default;
}
