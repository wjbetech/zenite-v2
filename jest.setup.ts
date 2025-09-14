import '@testing-library/jest-dom';
import React from 'react';

// Mock next/link simple behavior used in components
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => {
    return children ?? null;
  },
}));

jest.mock('next/router', () => ({
  useRouter() {
    return { pathname: '/' };
  },
}));
