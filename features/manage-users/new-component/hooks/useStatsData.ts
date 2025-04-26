import { useQuery } from '@tanstack/react-query'
import { MetricCardProps } from '../types'
import { Users, Shield } from 'lucide-react'

// Import fungsi dari komponen lama
import { fetchStatsData } from '../../service/stats'

/**
 * Hook untuk mengambil data statistik pengguna dan mengkonversinya
 * ke format yang cocok untuk komponen MetricCard
 */
export function useStatsData() {
  const {
    data: statsData = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStatsData,
  })

  // Map data statistik ke props untuk MetricCard
  const mappedData: MetricCardProps[] = statsData.map((stat) => {
    let iconComponent = Users
    let trend: 'up' | 'down' | 'stable' = 'stable'
    let color: 'cyan' | 'green' | 'blue' | 'purple' = 'blue'
    let detail = `${stat.value} pengguna`

    // Sesuaikan icon, trend, dan color berdasarkan jenis statistik
    if (stat.title === 'Total Users') {
      iconComponent = Users
      trend = 'up'
      color = 'cyan'
      detail = `${stat.value} total pengguna`
    } else if (stat.title.includes('New Users')) {
      iconComponent = Users
      trend = 'up'
      color = 'green'
      detail = `${stat.value} pengguna baru (7 hari terakhir)`
    } else if (stat.title.includes('Active Admins')) {
      iconComponent = Shield
      trend = 'stable'
      color = 'purple'
      detail = `${stat.value} admin aktif`
    }

    return {
      title: stat.title,
      value: stat.value,
      icon: iconComponent,
      trend,
      color,
      detail,
    }
  })

  return {
    statsMetrics: mappedData,
    isLoading,
    error,
  }
}
