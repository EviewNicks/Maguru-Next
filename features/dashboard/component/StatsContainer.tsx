'use client'
import StatsCard from './StatsCard'

const statsData = [
  { title: 'Total Users', value: 1520 },
  { title: 'New Users (Last 7 Days)', value: 35 },
  { title: 'Active Admins', value: 5 },
]

function StatsContainer() {
  return (
    <div className="grid md:grid-cols-2 gap-4 lg:grid-cols-3 border border-red-500  min-h-screen">
      {statsData.map((stat, index) => (
        <StatsCard key={index} title={stat.title} value={stat.value} />
      ))}
    </div>
  )
}
export default StatsContainer
