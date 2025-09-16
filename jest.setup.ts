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
if (typeof (global as any).Request === 'undefined') {
  // lightweight polyfill used only for reading `url` and `json()` in handlers
  class TestRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: any;
    constructor(url: string, opts: any = {}) {
      this.url = url;
      this.method = opts.method || 'GET';
      this.headers = (opts.headers as Record<string, string>) || {};
      this.body = opts.body;
    }
    async json() {
      try {
        return JSON.parse(this.body || '{}');
      } catch {
        return {};
      }
    }
  }
  // @ts-expect-error - test polyfill
  (global as any).Request = TestRequest;
}

if (typeof (global as any).Response === 'undefined') {
  class TestResponse {
    _body: any;
    status: number;
    headers: Record<string, string>;
    constructor(body?: any, init: any = {}) {
      this._body = body;
      this.status = init.status || 200;
      this.headers = init.headers || {};
    }
    async json() {
      if (typeof this._body === 'string') return JSON.parse(this._body);
      return this._body;
    }
    async text() {
      return typeof this._body === 'string' ? this._body : JSON.stringify(this._body);
    }
  }
  // @ts-expect-error - test polyfill
  (global as any).Response = TestResponse;
}
