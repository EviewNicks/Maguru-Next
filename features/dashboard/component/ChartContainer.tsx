'use client'
import { useQuery } from '@tanstack/react-query'
import { processChartData } from '../service/charts'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function ChartsContainer() {
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users')
      const data = await response.json()
      return data.users
    },
  })

  const chartData = processChartData(users)

  return (
    <section className="mt-8">
      <h1 className="text-4xl font-semibold text-center">
        Monthly User Growth
      </h1>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="users" fill="#2563eb" barSize={75} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}
export default ChartsContainer
