import Dashboard from './page'
import { SystemOverview } from './components/dashboard/SystemOverview'
import { useStatsData } from './hooks/useStatsData'
import { PerformanceChart } from './components/ui/PerformanceChart'
import { useChartData } from './hooks/useChartData'
import UserTableNew from './components/ui/UserTable'

// Export komponen dan hooks
export {
  SystemOverview,
  useStatsData,
  PerformanceChart,
  useChartData,
  UserTableNew,
}

export default Dashboard
