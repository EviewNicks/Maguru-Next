// import { ReadonlyURLSearchParams } from 'next/navigation'

// Mock for Next.js server components
export const NextResponse = {
  json: jest.fn().mockImplementation((body, init) => {
    // Kembalikan objek NextResponse seperti implementasi asli
    // dengan body sebagai properti yang dapat diakses oleh test
    if (init?.status) {
      console.log(`Response status: ${init.status}`)
    }

    // Kembalikan objek yang menyerupai NextResponse asli
    // dengan body terekam untuk assertion
    const response = {
      ...body,
      status: init?.status || 200,
      _body: body, // Menyimpan body asli untuk debugging
      // Tambahkan metode yang mungkin diperlukan
      json: jest.fn().mockResolvedValue(body),
      text: jest.fn().mockResolvedValue(JSON.stringify(body)),
    }

    return response
  }),
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly _body: any

  constructor(input: string | URL, init?: RequestInit) {
    const url = input instanceof URL ? input : new URL(input)
    this.url = url.toString()
    this.method = init?.method || 'GET'
    this.headers = new Headers(init?.headers)
    this._body = init?.body || {}

    // Create nextUrl with searchParams
    this.nextUrl = {
      searchParams: new URLSearchParams(url.search),
      pathname: url.pathname,
      search: url.search,
    }
  }

  // Add methods
  json() {
    // return Promise.resolve({})
    return Promise.resolve(this._body)
  }

  clone() {
    return new NextRequest(this.url, {
      method: this.method,
      headers: this.headers,
    })
  }
}

// Export as module
export default { NextRequest, NextResponse }
