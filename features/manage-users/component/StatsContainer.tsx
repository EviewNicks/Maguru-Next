'use client'
import { useQuery } from '@tanstack/react-query'
import StatsCard from './StatsCard'
import { fetchStatsData } from '../service/stats'

// const statsData = [
//   { title: 'Total Users', value: 1520 },
//   { title: 'New Users (Last 7 Days)', value: 35 },
//   { title: 'Active Admins', value: 5 },
// ]

function StatsContainer() {
  const { data: statsData = [] } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStatsData
  })

  return (
    <div className="grid md:grid-cols-2 gap-4 lg:grid-cols-3 ">
      {statsData.map((stat, index) => (
        <StatsCard key={index} title={stat.title} value={stat.value} />
      ))}
    </div>
  )
}
export default StatsContainer
