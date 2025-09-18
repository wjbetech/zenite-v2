/* eslint-disable @typescript-eslint/no-explicit-any */
// Minimal jest globals for TypeScript when @types/jest is not installed
declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void) => void;
declare const beforeEach: (fn: () => void) => void;
declare const afterEach: (fn: () => void) => void;
declare const expect: any;

declare namespace jest {
  function clearAllMocks(): void;
  function fn(): any;
  function mock(moduleName: string, factory?: any): void;
  function spyOn(obj: any, method: string): any;
  const Mock: any;
  type Mock = any;
}
