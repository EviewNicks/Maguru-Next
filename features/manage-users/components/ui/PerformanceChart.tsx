'use client'
import { useChartData } from '../../hooks/useChartData'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/**
 * Komponen PerformanceChart untuk menampilkan grafik performa user growth per bulan
 * menggunakan data month dan users dari API sama persis dengan ChartContainer
 */
export function PerformanceChart() {
  // Mengambil data dari hook
  const { chartData, isLoading, error } = useChartData()

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
      label: 'Users',
      color: '#06b6d4', // cyan-500
    },
  } satisfies ChartConfig

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

  return (
    <div className="h-full w-full" data-testid="performance-chart">
      <div className="h-full w-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-slate-100">
            Monthly User Growth 2025
          </h2>
          <Badge
            variant="outline"
            className="bg-slate-800/50 text-cyan-400 border-cyan-500/50 text-xs"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 mr-1 animate-pulse"></div>
            LIVE
          </Badge>
        </div>

        <ChartContainer config={chartConfig} className="min-h-[180px] w-full">
          <BarChart accessibilityLayer data={completeChartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="users" fill="#06b6d4" radius={4} />
          </BarChart>
        </ChartContainer>

        {/* Info box dengan System Load 41% */}
        <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm rounded-md px-3 py-2 border border-slate-700/50">
          <div className="text-xs text-slate-400">System Load</div>
          <div className="text-lg font-mono text-cyan-400">41%</div>
        </div>
      </div>
    </div>
  )
}
