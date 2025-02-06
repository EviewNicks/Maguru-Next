import ChartsContainer from '@/features/dashboard/component/ChartContainer'
import StatsContainer from '@/features/dashboard/component/StatsContainer'
import UserTable from '@/features/dashboard/component/UserTable'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
// import {
//   ResizableHandle,
//   ResizablePanel,
//   ResizablePanelGroup,
// } from '@/components/ui/resizable'

async function StatsPage() {
  const queryClient = new QueryClient()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StatsContainer />
      <ChartsContainer />
      <UserTable />
    </HydrationBoundary>
  )
}
export default StatsPage

// // The new version of the code calls the `getStatsAction` function to fetch the stats data from the server.
