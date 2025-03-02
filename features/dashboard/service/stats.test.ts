import { fetchStatsData } from './stats'
import { User } from '@/types/user'

// Mock fetch globally
global.fetch = jest.fn()

describe('Stats Service', () => {
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(), // Hari ini
    },
    {
      id: '2',
      name: 'Old Admin',
      email: 'oldadmin@example.com',
      role: 'admin',
      status: 'inactive',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '3',
      name: 'New Student',
      email: 'student@example.com',
      role: 'mahasiswa',
      status: 'active',
      createdAt: new Date().toISOString(), // Hari ini
    },
    {
      id: '4',
      name: 'Old Student',
      email: 'oldstudent@example.com',
      role: 'mahasiswa',
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ]

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('fetches and processes stats data correctly', async () => {
    // Mock successful API response
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: mockUsers }),
    })

    const stats = await fetchStatsData()

    expect(stats).toEqual([
      { title: 'Total Users', value: 4 }, // Total semua user
      { title: 'New Users (Last 7 Days)', value: 2 }, // 2 user baru (hari ini)
      { title: 'Active Admins', value: 1 }, // 1 admin aktif
    ])

    // Verify API call
    expect(fetch).toHaveBeenCalledWith('/api/users')
  })

  it('handles API error', async () => {
    // Mock failed API response
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    })

    await expect(fetchStatsData()).rejects.toThrow('Failed to fetch stats data')
  })

  it('handles empty user list', async () => {
    // Mock API response with empty user list
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: [] }),
    })

    const stats = await fetchStatsData()

    expect(stats).toEqual([
      { title: 'Total Users', value: 0 },
      { title: 'New Users (Last 7 Days)', value: 0 },
      { title: 'Active Admins', value: 0 },
    ])
  })

  it('calculates new users correctly', async () => {
    const sixDaysAgo = new Date()
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6)

    const usersWithRecentSignups = [
      ...mockUsers,
      {
        id: '5',
        name: 'Recent User',
        email: 'recent@example.com',
        role: 'mahasiswa',
        status: 'active',
        createdAt: sixDaysAgo.toISOString(),
      },
    ]

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: usersWithRecentSignups }),
    })

    const stats = await fetchStatsData()
    const newUsersStats = stats.find(
      (stat) => stat.title === 'New Users (Last 7 Days)'
    )
    expect(newUsersStats?.value).toBe(3) // 2 dari hari ini + 1 dari 6 hari lalu
  })

  it('counts active admins correctly', async () => {
    const usersWithMoreAdmins = [
      ...mockUsers,
      {
        id: '5',
        name: 'Another Admin',
        email: 'another@example.com',
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ]

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: usersWithMoreAdmins }),
    })

    const stats = await fetchStatsData()
    const adminStats = stats.find((stat) => stat.title === 'Active Admins')
    expect(adminStats?.value).toBe(2) // 2 admin aktif
  })
})
