import { fetchStatsData } from './stats'
import { User } from '@/types/user'

// Mock fetch globally
global.fetch = jest.fn() as jest.Mock

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

describe('fetchStatsData', () => {
  // Setup mocking global fetch
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('should fetch stats data successfully', async () => {
    // Mock data
    const mockUsers = [
      {
        id: '1',
        name: 'User 1',
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'User 2',
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'User 3',
        role: 'admin',
        status: 'inactive',
        createdAt: '2023-01-01T00:00:00Z',
      },
    ]

    const mockResponse = {
      users: mockUsers,
      metadata: { total: 3, page: 1, limit: 10 },
    }

    // Mock fetch implementation
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    // Call the function
    const result = await fetchStatsData()

    // Verify fetch was called with correct URL
    expect(fetch).toHaveBeenCalledWith('/api/users')

    // Verify the returned data structure
    expect(result).toBeInstanceOf(Array)
    expect(result).toHaveLength(3)

    // Check each stats item
    expect(result[0]).toEqual({ title: 'Total Users', value: 3 })
    expect(result[1].title).toBe('New Users (Last 7 Days)')
    expect(result[2]).toEqual({ title: 'Active Admins', value: 1 })
  })

  it('should throw error when fetch fails', async () => {
    // Mock fetch implementation for error case
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
    } as Response)

    // Assert that function throws an error
    await expect(fetchStatsData()).rejects.toThrow('Failed to fetch stats data')
  })

  it('should calculate new users within the last 7 days correctly', async () => {
    // Current date for testing
    const currentDate = new Date()

    // Create dates for testing
    const eightDaysAgo = new Date(currentDate)
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8)

    const sixDaysAgo = new Date(currentDate)
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6)

    // Mock users with specific dates
    const mockUsers = [
      {
        id: '1',
        name: 'Old User',
        role: 'user',
        status: 'active',
        createdAt: eightDaysAgo.toISOString(),
      },
      {
        id: '2',
        name: 'New User 1',
        role: 'user',
        status: 'active',
        createdAt: sixDaysAgo.toISOString(),
      },
      {
        id: '3',
        name: 'New User 2',
        role: 'admin',
        status: 'active',
        createdAt: currentDate.toISOString(),
      },
    ]

    const mockResponse = {
      users: mockUsers,
      metadata: { total: 3, page: 1, limit: 10 },
    }

    // Mock fetch implementation
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    // Call the function
    const result = await fetchStatsData()

    // Verify the new users count (should be 2)
    expect(result[1]).toEqual({ title: 'New Users (Last 7 Days)', value: 2 })
  })

  it('should count active admins correctly', async () => {
    // Mock users with different roles and statuses
    const mockUsers = [
      {
        id: '1',
        name: 'Admin Active',
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Admin Inactive',
        role: 'admin',
        status: 'inactive',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'User Active',
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'Admin Active 2',
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ]

    const mockResponse = {
      users: mockUsers,
      metadata: { total: 4, page: 1, limit: 10 },
    }

    // Mock fetch implementation
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    // Call the function
    const result = await fetchStatsData()

    // Verify active admins count (should be 2)
    expect(result[2]).toEqual({ title: 'Active Admins', value: 2 })
  })
})
