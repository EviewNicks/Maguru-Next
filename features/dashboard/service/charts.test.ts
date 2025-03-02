import { processChartData } from './charts'
import { User } from '@/types/user'

describe('Charts Service', () => {
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'User 1',
      email: 'user1@example.com',
      role: 'mahasiswa',
      status: 'active',
      createdAt: '2024-01-15T00:00:00.000Z', // January
    },
    {
      id: '2',
      name: 'User 2',
      email: 'user2@example.com',
      role: 'mahasiswa',
      status: 'active',
      createdAt: '2024-02-15T00:00:00.000Z', // February
    },
    {
      id: '3',
      name: 'User 3',
      email: 'user3@example.com',
      role: 'admin',
      status: 'active',
      createdAt: '2024-02-20T00:00:00.000Z', // February
    },
  ]

  it('processes user data into monthly chart data correctly', () => {
    const result = processChartData(mockUsers)

    expect(result).toEqual([
      { month: 'Jan', users: 1 },
      { month: 'Feb', users: 2 },
    ])
  })

  it('handles empty user array', () => {
    const result = processChartData([])
    expect(result).toEqual([])
  })

  it('filters out months with zero users', () => {
    const result = processChartData(mockUsers)

    // Memastikan bulan tanpa user tidak muncul di hasil
    const marchData = result.find((item) => item.month === 'Mar')
    expect(marchData).toBeUndefined()
  })

  it('aggregates multiple users in the same month', () => {
    const result = processChartData(mockUsers)

    // Memastikan 2 user di bulan Februari diagregasi dengan benar
    const febData = result.find((item) => item.month === 'Feb')
    expect(febData?.users).toBe(2)
  })

  it('handles users from different years correctly', () => {
    const usersFromDifferentYears: User[] = [
      ...mockUsers,
      {
        id: '4',
        name: 'User 4',
        email: 'user4@example.com',
        role: 'mahasiswa',
        status: 'active',
        createdAt: '2023-02-15T00:00:00.000Z', // February tahun lalu
      },
    ]

    const result = processChartData(usersFromDifferentYears)

    // Memastikan user dari tahun yang berbeda tetap diagregasi per bulan
    const febData = result.find((item) => item.month === 'Feb')
    expect(febData?.users).toBe(3)
  })
})
