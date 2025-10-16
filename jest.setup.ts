import '@testing-library/jest-dom';
import React from 'react';

// Mock next/link simple behavior used in components
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => children ?? null,
}));

jest.mock('next/router', () => ({
  useRouter() {
    return { pathname: '/' };
  },
}));

// Provide a minimal Request polyfill for tests so `next/server` can import safely
if (typeof (global as unknown as { Request?: unknown }).Request === 'undefined') {
  type TestRequestOptions = { method?: string; headers?: Record<string, string>; body?: string };

  class TestRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
    constructor(url: string, opts: TestRequestOptions = {}) {
      this.url = url;
      this.method = opts.method || 'GET';
      this.headers = opts.headers || {};
      this.body = opts.body;
    }
    async json(): Promise<Record<string, unknown>> {
      try {
        return JSON.parse(this.body || '{}');
      } catch {
        return {};
      }
    }
  }
  // attach test polyfill Request
  (global as unknown as { Request?: unknown }).Request = TestRequest;
}

// Shim window.scrollTo / requestAnimationFrame which are not implemented in JSDOM
if (typeof (global as unknown as { scrollTo?: unknown }).scrollTo === 'undefined') {
  global.scrollTo = () => {};
}

try {
  // attach to window if present in the test environment
  if (typeof window !== 'undefined') {
    if (typeof window.scrollTo === 'undefined') window.scrollTo = () => {};
    // basic rAF shim used by animation libraries
    if (typeof window.requestAnimationFrame === 'undefined') {
      window.requestAnimationFrame = (cb: FrameRequestCallback) =>
        setTimeout(cb, 0) as unknown as number;
    }
    if (typeof window.cancelAnimationFrame === 'undefined') {
      window.cancelAnimationFrame = (id?: number) => clearTimeout(id as unknown as number);
    }
  }
} catch {
  // ignore when window isn't available
}

// Mock auth helpers used by API routes so tests run with a deterministic
// authenticated user. This only affects the Jest environment (via setup file).
jest.mock('src/lib/auth-helpers', () => ({
  requireAuth: async () => ({ userId: 'test_user', error: null }),
  getAuthUserId: async () => 'test_user',
}));

// Provide a minimal Response polyfill used by some test helpers
if (typeof (global as unknown as { Response?: unknown }).Response === 'undefined') {
  class TestResponse {
    _body: unknown;
    status: number;
    headers: Record<string, string>;
    constructor(body?: unknown, init: { status?: number; headers?: Record<string, string> } = {}) {
      this._body = body;
      this.status = init.status || 200;
      this.headers = init.headers || {};
    }
    async json(): Promise<unknown> {
      if (typeof this._body === 'string') return JSON.parse(this._body as string);
      return this._body;
    }
    async text(): Promise<string> {
      return typeof this._body === 'string' ? (this._body as string) : JSON.stringify(this._body);
    }
  }
  (global as unknown as { Response?: unknown }).Response = TestResponse;
}

// Provide a lightweight global.fetch if not provided by the Node/JSDOM environment.
if (typeof (global as unknown as { fetch?: unknown }).fetch === 'undefined') {
  global.fetch = async () => {
    return {
      ok: false,
      status: 500,
      json: async () => ({}),
    } as unknown as Response;
  };
}
