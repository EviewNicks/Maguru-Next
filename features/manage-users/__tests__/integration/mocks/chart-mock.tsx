import React from 'react'
import { mockChartData } from './dashboardData'

interface PerformanceChartMockProps {
  isLoading?: boolean
  error?: Error | null
  testId?: string
}

/**
 * Mock untuk komponen PerformanceChart
 * Menyediakan versi sederhana dari chart untuk testing dengan berbagai kondisi
 */
export const PerformanceChartMock: React.FC<PerformanceChartMockProps> = ({
  isLoading = false,
  error = null,
  testId = 'performance-chart-mock',
}) => {
  // Jika loading, tampilkan indikator loading
  if (isLoading) {
    return (
      <div
        className="h-full w-full flex items-center justify-center"
        data-testid="loading-spinner"
      >
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
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

  // Render chart dalam bentuk tabel sederhana untuk testing
  return (
    <div className="h-full w-full" data-testid={testId}>
      <div className="h-full w-full flex flex-col">
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Monthly User Growth 2025
        </h3>

        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700/50">
                <th className="py-1 px-2 text-left">Month</th>
                <th className="py-1 px-2 text-right">Users</th>
              </tr>
            </thead>
            <tbody>
              {mockChartData.map((item, index) => (
                <tr key={index} className="border-b border-slate-700/30">
                  <td className="py-1 px-2 text-slate-300">{item.month}</td>
                  <td className="py-1 px-2 text-right text-cyan-400">
                    {item.users}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/**
 * Mock untuk ChartContainer dari shadcn/ui charts
 */
export const ChartContainerMock: React.FC<{
  children: React.ReactNode
  className?: string
  config?: Record<string, unknown>
}> = ({ children, className }) => {
  return (
    <div
      className={`min-h-[180px] w-full ${className || ''}`}
      data-testid="chart-container-mock"
    >
      {children}
    </div>
  )
}

/**
 * Mock untuk BarChart dari recharts
 */
export const BarChartMock: React.FC<{
  children: React.ReactNode
  accessibilityLayer?: boolean
  data?: Array<Record<string, unknown>>
}> = ({ children }) => {
  return <div data-testid="bar-chart-mock">{children}</div>
}

/**
 * Mock untuk CartesianGrid dari recharts
 */
export const CartesianGridMock: React.FC<{
  vertical?: boolean
}> = () => {
  return <div data-testid="cartesian-grid-mock"></div>
}

/**
 * Mock untuk XAxis dari recharts
 */
export const XAxisMock: React.FC<{
  dataKey: string
  tickLine?: boolean
  tickMargin?: number
  axisLine?: boolean
  tickFormatter?: (value: string) => string
}> = () => {
  return <div data-testid="x-axis-mock"></div>
}

/**
 * Mock untuk ChartTooltip
 */
export const ChartTooltipMock: React.FC<{
  content: React.ReactNode
}> = () => {
  return <div data-testid="chart-tooltip-mock"></div>
}

/**
 * Mock untuk ChartLegend
 */
export const ChartLegendMock: React.FC<{
  content: React.ReactNode
}> = () => {
  return <div data-testid="chart-legend-mock"></div>
}

/**
 * Mock untuk Bar dari recharts
 */
export const BarMock: React.FC<{
  dataKey: string
  fill: string
  radius: number
}> = () => {
  return <div data-testid="bar-mock"></div>
}
