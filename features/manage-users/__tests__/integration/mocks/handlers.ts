import { http, HttpResponse } from 'msw'
import { getMockUsersResponse } from './userData'

/**
 * Handlers untuk mock API response dari endpoint pengguna
 * Digunakan dengan MSW untuk integration testing
 */
export const handlers = [
  /**
   * Mock GET endpoint untuk mengambil daftar pengguna
   * Mendukung filtering berdasarkan role, status, search query, dan pagination
   */
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url)
    const role = url.searchParams.get('role')
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const limit = parseInt(url.searchParams.get('limit') || '10', 10)

    const response = getMockUsersResponse(role, status, search, page, limit)

    return HttpResponse.json(response, { status: 200 })
  }),

  /**
   * Mock endpoint untuk simulasi error pada GET /api/users
   */
  http.get('/api/users/error', () => {
    return HttpResponse.json(
      { message: 'Mock server error for testing' },
      { status: 500 }
    )
  }),

  /**
   * Mock endpoint untuk update role pengguna
   */
  http.patch('/api/users/:id/role', ({ params }) => {
    const { id } = params
    // Asumsikan body mengandung { role: 'admin' | 'mahasiswa' | 'dosen' }

    return HttpResponse.json(
      {
        id,
        success: true,
        message: 'User role updated successfully',
      },
      { status: 200 }
    )
  }),

  /**
   * Mock endpoint untuk update status pengguna
   */
  http.patch('/api/users/:id/status', ({ params }) => {
    const { id } = params
    // Asumsikan body mengandung { status: 'active' | 'inactive' }

    return HttpResponse.json(
      {
        id,
        success: true,
        message: 'User status updated successfully',
      },
      { status: 200 }
    )
  }),
]
