// import { ReadonlyURLSearchParams } from 'next/navigation'

// Mock for Next.js server components
export const NextResponse = {
  json: jest.fn().mockImplementation((body, init) => ({
    status: init?.status || 200,
    body,
  })),
  redirect: jest.fn().mockImplementation((url) => ({
    url,
    status: 302,
  })),
  next: jest.fn().mockImplementation(() => ({
    status: 200,
  })),
}

// Mock NextRequest class
export class NextRequest {
  public readonly method: string
  public readonly url: string
  public readonly headers: Headers
  public readonly nextUrl: {
    searchParams: URLSearchParams
    pathname: string
    search: string
  }

  constructor(input: string | URL, init?: RequestInit) {
    const url = input instanceof URL ? input : new URL(input)
    this.url = url.toString()
    this.method = init?.method || 'GET'
    this.headers = new Headers(init?.headers)

    // Create nextUrl with searchParams
    this.nextUrl = {
      searchParams: new URLSearchParams(url.search),
      pathname: url.pathname,
      search: url.search,
    }
  }

  // Add methods
  json() {
    return Promise.resolve({})
  }

  clone() {
    return this
  }
}

// Export as module
export default { NextRequest, NextResponse }
