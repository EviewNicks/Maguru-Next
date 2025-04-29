import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * Setup MSW server untuk mocking API calls dalam integration test
 */
export const server = setupServer(...handlers)

// Konfigurasi server untuk pengujian
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
