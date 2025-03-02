// Setup global Request dan Response untuk Next.js API Routes
class MockRequest {
  url: string
  method: string
  headers: Headers
  body: any

  constructor(input: string | URL, init?: RequestInit) {
    this.url = input.toString()
    this.method = init?.method || 'GET'
    this.headers = new Headers(init?.headers)
    this.body = init?.body
  }
}

class MockResponse {
  status: number
  statusText: string
  headers: Headers
  body: any

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.status = init?.status || 200
    this.statusText = init?.statusText || 'OK'
    this.headers = new Headers(init?.headers)
    this.body = body
  }

  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
  }
}

// Mock NextResponse
const mockNextResponse = {
  json: (data: any, init?: ResponseInit) => {
    return new MockResponse(data, init)
  },
}

jest.mock('next/server', () => ({
  NextResponse: mockNextResponse,
}))

global.Request = MockRequest as any
global.Response = MockResponse as any

// Mock console methods untuk mengurangi noise dalam output test
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}
