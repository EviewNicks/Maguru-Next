export const webcrypto = {
  getRandomValues: jest.fn(),
  randomUUID: jest.fn(),
}

export const runtime = {
  crypto: webcrypto,
}
