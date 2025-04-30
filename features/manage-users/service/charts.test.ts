import { processChartData } from './charts'
import { User } from '@/types/user'

describe('processChartData', () => {
  it('groups users by month correctly', () => {
    const mockUsers = [
      { id: '1', createdAt: '2023-01-15T00:00:00.000Z' } as User,
      { id: '2', createdAt: '2023-01-20T00:00:00.000Z' } as User,
      { id: '3', createdAt: '2023-02-10T00:00:00.000Z' } as User,
      { id: '4', createdAt: '2023-03-05T00:00:00.000Z' } as User,
    ]

    const result = processChartData(mockUsers)

    // Hasil seharusnya dikelompokkan per bulan
    expect(result).toEqual([
      { month: 'Jan', users: 2 },
      { month: 'Feb', users: 1 },
      { month: 'Mar', users: 1 },
    ])
  })

  it('handles empty input', () => {
    const result = processChartData([])

    // Hasil untuk input kosong seharusnya array kosong
    expect(result).toEqual([])
  })

  it('only includes months with data', () => {
    const mockUsers = [
      { id: '1', createdAt: '2023-01-15T00:00:00.000Z' } as User,
      { id: '2', createdAt: '2023-03-20T00:00:00.000Z' } as User,
    ]

    const result = processChartData(mockUsers)

    // Seharusnya hanya ada Jan dan Mar (Feb tidak ada)
    expect(result).toEqual([
      { month: 'Jan', users: 1 },
      { month: 'Mar', users: 1 },
    ])

    // Pastikan Feb tidak ada dalam hasil
    expect(result.find((item) => item.month === 'Feb')).toBeUndefined()
  })

  it('handles multiple users in the same month', () => {
    const mockUsers = [
      { id: '1', createdAt: '2023-04-01T00:00:00.000Z' } as User,
      { id: '2', createdAt: '2023-04-15T00:00:00.000Z' } as User,
      { id: '3', createdAt: '2023-04-30T00:00:00.000Z' } as User,
    ]

    const result = processChartData(mockUsers)

    // Seharusnya hanya ada satu entry untuk Apr dengan count 3
    expect(result).toEqual([{ month: 'Apr', users: 3 }])
  })

  it('handles invalid dates', () => {
    const mockUsers = [{ id: '1', createdAt: 'invalid-date' } as User]

    // Process data dengan tanggal invalid
    const result = processChartData(mockUsers)

    // Karena tanggal invalid, tidak ada data yang dimasukkan ke dalam hasil
    expect(result).toEqual([])
  })

  it('sorts months in calendar order', () => {
    // Sengaja urutan tanggal tidak berurutan
    const mockUsers = [
      { id: '1', createdAt: '2023-09-01T00:00:00.000Z' } as User,
      { id: '2', createdAt: '2023-01-15T00:00:00.000Z' } as User,
      { id: '3', createdAt: '2023-05-30T00:00:00.000Z' } as User,
    ]

    const result = processChartData(mockUsers)

    // Bulan-bulan harus terurut secara kalender, bukan berdasar jumlah pengguna
    expect(result[0].month).toBe('Jan')
    expect(result[1].month).toBe('May')
    expect(result[2].month).toBe('Sep')
  })
})
