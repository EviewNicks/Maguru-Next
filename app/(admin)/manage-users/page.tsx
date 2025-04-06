export const dynamic = 'force-dynamic'

import { fetchStatsData } from '@/features/manage-users/service/stats'
import ChartsContainer from '@/features/manage-users/component/ChartContainer'
import StatsContainer from '@/features/manage-users/component/StatsContainer'
import UserTable from '@/features/manage-users/component/UserTable'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/getQueryClient'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

interface ClerkMetadata {
  role?: string
}

async function StatsPage() {
  // Periksa autentikasi dan role pengguna
  const authData = await auth()
  if (!authData.userId) {
    redirect('/')
  }

  // Jika bukan admin, redirect ke dashboard user
  const role = (authData.sessionClaims?.metadata as ClerkMetadata)?.role
  if (role !== 'admin') {
    redirect('/user-dashboard')
  }

  const queryClient = getQueryClient()

  // Prefetch all required data
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ['stats'], queryFn: fetchStatsData }),
    queryClient.prefetchQuery({
      queryKey: ['users'],
      queryFn: async () => {
        const response = await fetch('/api/users')
        const data = await response.json()
        return data.users
      },
    }),
  ])

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
