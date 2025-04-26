'use client'

import React from 'react'
import { useChartData } from '../../hooks/useChartData'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/**
 * Komponen PerformanceChart untuk menampilkan grafik performa user growth per bulan
 * menggunakan data month dan users dari API sama persis dengan ChartContainer
 */
export function PerformanceChart() {
  // Mengambil data dari hook
  const { chartData, isLoading, error } = useChartData()

  // Jika loading, tampilkan indikator loading
  if (isLoading) {
    return (
      <div
        className="h-full w-full flex items-center justify-center"
        data-testid="loading-spinner"
      >
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-slate-400">Loading chart data...</p>
        </div>
      </div>
    )
  }

  // Jika error, tampilkan pesan error
  if (error) {
    return (
      <div
        className="h-full w-full flex items-center justify-center"
        data-testid="chart-error"
      >
        <div className="text-red-500">
          {error instanceof Error ? error.message : 'Gagal memuat data chart'}
        </div>
      </div>
    )
  }

  // Pastikan semua bulan tahun 2025 tersedia
  const allMonths = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  // Buat array data dengan semua bulan (tambahkan yang belum ada dengan nilai 0)
  const completeChartData = allMonths.map((month) => {
    const existingData = chartData.find((item) => item.month === month)
    return {
      month: month,
      users: existingData ? existingData.users : 0,
      // Tambahkan warna khusus untuk bulan April
      fill: month === 'Apr' ? '#06b6d4' : 'transparent',
    }
  })

  // Define chart config
  const chartConfig = {
    users: {
      label: 'Monthly User Growth 2025',
      color: '#3b82f6', // blue-500
    },
    april: {
      label: 'April',
      color: '#06b6d4', // cyan-500
    },
    load: {
      label: 'System Load',
      color: '#06b6d4', // cyan-500
    },
  }

  return (
    <Card
      className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden"
      data-testid="performance-chart"
    >
      <CardHeader className="border-b border-slate-700/50 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-100 text-lg font-semibold">
            Monthly User Growth 2025
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className="bg-slate-800/50 text-cyan-400 border-cyan-500/50 text-xs"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 mr-1 animate-pulse"></div>
              LIVE
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative h-64">
          <ChartContainer config={chartConfig} className="aspect-auto h-full">
            <BarChart
              data={completeChartData}
              barGap={0}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#334155"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                tick={{ fill: '#94a3b8' }}
                tickFormatter={(value) =>
                  value === 'Apr' ? `${value}` : value
                }
                // Menampilkan hanya bulan April
                tickCount={1}
                ticks={['Apr']}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                tick={{ fill: '#94a3b8' }}
                width={25}
                domain={[0, 8]} // Menetapkan domain Y dari 0 sampai 8
                ticks={[0, 2, 4, 6, 8]} // Menampilkan ticks pada 0, 2, 4, 6, 8
              />
              <Tooltip
                cursor={{ fill: 'rgba(30, 41, 59, 0.4)' }}
                content={
                  <ChartTooltipContent
                    labelClassName="text-slate-300"
                    className="bg-slate-800 border-slate-700 text-slate-300"
                    formatter={(value, name) => [
                      value,
                      name === 'users' ? 'Users' : name,
                    ]}
                  />
                }
              />
              <Bar
                dataKey="users"
                name="Users"
                fill="#06b6d4"
                radius={[4, 4, 0, 0]}
                fillOpacity={0.9}
                isAnimationActive={true}
              />
            </BarChart>
          </ChartContainer>

          {/* Info box dengan System Load 51% */}
          <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm rounded-md px-3 py-2 border border-slate-700/50">
            <div className="text-xs text-slate-400">System Load</div>
            <div className="text-lg font-mono text-cyan-400">51%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
