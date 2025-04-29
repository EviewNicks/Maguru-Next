import { faker } from '@faker-js/faker'

export interface MockUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'mahasiswa' | 'dosen'
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

/**
 * Menghasilkan daftar pengguna palsu untuk keperluan testing
 * @param count Jumlah pengguna yang akan dibuat
 * @returns Array berisi data pengguna palsu
 */
export function generateMockUsers(count = 10): MockUser[] {
  faker.seed(123) // Menggunakan seed yang sama untuk hasil konsisten dalam test

  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(['admin', 'mahasiswa', 'dosen']) as
      | 'admin'
      | 'mahasiswa'
      | 'dosen',
    status: faker.helpers.arrayElement(['active', 'inactive']) as
      | 'active'
      | 'inactive',
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  }))
}

/**
 * Memfilter dan mengembalikan data pengguna berdasarkan parameter filter
 * @param role Filter berdasarkan role
 * @param status Filter berdasarkan status
 * @param search Filter berdasarkan nama atau email
 * @param page Halaman yang diminta
 * @param limit Jumlah item per halaman
 * @returns Object berisi data pengguna yang difilter dan metadata pagination
 */
export function getMockUsersResponse(
  role: string | null,
  status: string | null,
  search: string | null,
  page = 1,
  limit = 10
) {
  // Menghasilkan dataset yang lebih besar untuk pagination
  let users = generateMockUsers(50)

  // Filter berdasarkan role jika parameter role ada dan bukan 'all'
  if (role && role !== 'all') {
    users = users.filter((user) => user.role === role)
  }

  // Filter berdasarkan status jika parameter status ada dan bukan 'all'
  if (status && status !== 'all') {
    users = users.filter((user) => user.status === status)
  }

  // Filter berdasarkan pencarian pada nama atau email
  if (search) {
    const searchLower = search.toLowerCase()
    users = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
    )
  }

  // Menghitung data pagination
  const totalItems = users.length
  const totalPages = Math.ceil(totalItems / limit)
  const currentPage = Math.min(page, totalPages)
  const offset = (currentPage - 1) * limit

  // Mengembalikan data sesuai pagination
  return {
    users: users.slice(offset, offset + limit),
    metadata: {
      total: totalItems,
      currentPage,
      totalPages,
      limit,
    },
  }
}
