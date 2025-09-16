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

// Provide a minimal Request polyfill for tests so `next/server` can import safely
if (typeof (global as unknown as { Request?: unknown }).Request === 'undefined') {
  // lightweight polyfill used only for reading `url` and `json()` in handlers
  type TestRequestOptions = {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  };

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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  (global as unknown as { Request?: unknown }).Request = TestRequest;
}

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
  // attach test polyfill Response
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  (global as unknown as { Response?: unknown }).Response = TestResponse;
}
