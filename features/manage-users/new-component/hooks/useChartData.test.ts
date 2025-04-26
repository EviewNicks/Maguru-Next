import { renderHook, waitFor } from '@testing-library/react'
import { useChartData } from './useChartData'
import { processChartData } from '../../service/charts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { ReactNode } from 'react'

// Mock untuk service charts
jest.mock('../../service/charts', () => ({
  processChartData: jest.fn()
}))

// Mock untuk fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ 
      users: [
        { id: '1', createdAt: '2023-01-15T00:00:00.000Z' },
        { id: '2', createdAt: '2023-02-20T00:00:00.000Z' },
        { id: '3', createdAt: '2023-02-25T00:00:00.000Z' },
        { id: '4', createdAt: '2023-03-10T00:00:00.000Z' }
      ] 
    })
  })
) as jest.Mock

// Setup QueryClient untuk test
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  
  // Definisikan wrapper dengan benar
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useChartData hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock implementasi processChartData
    const mockChartData = [
      { month: 'Jan', users: 1 },
      { month: 'Feb', users: 2 },
      { month: 'Mar', users: 1 }
    ]
    
    ;(processChartData as jest.Mock).mockReturnValue(mockChartData)
  })
  
  it('fetches and processes chart data correctly', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useChartData(), { wrapper })
    
    // Tunggu sampai data tersedia
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    // Verifikasi bahwa fetch dipanggil dengan benar
    expect(fetch).toHaveBeenCalledWith('/api/users')
    
    // Verifikasi bahwa processChartData dipanggil
    expect(processChartData).toHaveBeenCalled()
    
    // Memeriksa hasil hook - seharusnya menampilkan data yang dihasilkan oleh processChartData
    expect(result.current.chartData).toHaveLength(3) // 3 bulan dari data mock
    
    // Memeriksa struktur data hasil
    const firstPoint = result.current.chartData[0]
    expect(firstPoint).toHaveProperty('month', 'Jan')
    expect(firstPoint).toHaveProperty('users', 1)
    // Tidak ada lagi properti tambahan seperti cpuHeight
  })
  
  it('handles empty data gracefully', async () => {
    // Mock data kosong
    ;(processChartData as jest.Mock).mockReturnValue([])
    
    const wrapper = createWrapper()
    const { result } = renderHook(() => useChartData(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    // Seharusnya menghasilkan 12 bulan (Jan-Dec) sebagai data dummy
    expect(result.current.chartData).toHaveLength(12)
    
    // Memeriksa bahwa semua data memiliki struktur yang benar
    result.current.chartData.forEach(point => {
      expect(point).toHaveProperty('month')
      expect(point).toHaveProperty('users')
      expect(point.users).toBeGreaterThan(0)
      // Tidak ada lagi properti tambahan
    })
  })
  
  it('handles API errors', async () => {
    // Mock API error
    global.fetch = jest.fn(() => Promise.reject('API Error')) as jest.Mock
    
    const wrapper = createWrapper()
    const { result } = renderHook(() => useChartData(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
    
    // Masih seharusnya menghasilkan data default
    expect(result.current.chartData).toBeDefined()
  })
}) 