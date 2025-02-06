'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const dummyChartData = [
  { month: 'Jan', users: 120 },
  { month: 'Feb', users: 150 },
  { month: 'Mar', users: 170 },
  { month: 'Apr', users: 200 },
  { month: 'May', users: 240 },
  { month: 'Jun', users: 280 },
]

function ChartsContainer() {
  return (
    <section className="mt-8">
      <h1 className="text-4xl font-semibold text-center">
        Monthly User Growth
      </h1>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dummyChartData} margin={{ top: 50 }}>
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
