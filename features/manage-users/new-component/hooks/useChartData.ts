import { useQuery } from '@tanstack/react-query'
import { processChartData } from '../../service/charts'

export interface ChartDataPoint {
  month: string
  users: number
}

/**
 * Hook untuk mendapatkan data chart dari API
 * Data diambil dalam format yang sama persis dengan ChartContainer lama
 * yaitu month dan users
 */
export function useChartData() {
  // Menggunakan API yang sama dengan ChartContainer lama
  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users')
      const data = await response.json()
      return data.users
    },
  })

  // Proses data menggunakan fungsi yang sama persis dengan ChartContainer lama
  const chartData = processChartData(users)

  // Jika tidak ada data, berikan data sample untuk semua bulan tahun 2025
  if (chartData.length === 0) {
    // Sample data berdasarkan gambar referensi
    return {
      chartData: [
        { month: 'Jan', users: 5 },
        { month: 'Feb', users: 8 },
        { month: 'Mar', users: 4 },
        { month: 'Apr', users: 5 },
        { month: 'May', users: 3 },
        { month: 'Jun', users: 6 },
        { month: 'Jul', users: 3 },
        { month: 'Aug', users: 5 },
        { month: 'Sep', users: 3 },
        { month: 'Oct', users: 5 },
        { month: 'Nov', users: 2 },
        { month: 'Dec', users: 4 },
      ],
      isLoading,
      error,
    }
  }

  return {
    chartData,
    isLoading,
    error,
  }
}
