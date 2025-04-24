export const dynamic = 'force-dynamic'

import { fetchStatsData } from '@/features/manage-users/service/stats'
import ChartsContainer from '@/features/manage-users/component/ChartContainer'
import StatsContainer from '@/features/manage-users/component/StatsContainer'
import UserTable from '@/features/manage-users/component/UserTable'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/getQueryClient'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import RoleProtected from '@/components/RoleProtected'

interface ClerkMetadata {
  role?: string
}

async function StatsPage() {
  // Periksa autentikasi
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    redirect('/')
  }

  // Coba ambil role dari metadata Clerk
  const metadata = (sessionClaims?.metadata as ClerkMetadata) || {}
  let userRole = metadata.role

  // Jika role tidak ada di metadata, coba ambil dari database
  if (!userRole) {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
      })

      if (user) {
        userRole = user.role
      }
    } catch (error) {
      console.error('Error saat mengambil data pengguna:', error)
    }
  }

  // Jika bukan admin, redirect ke dashboard user
  if (userRole !== 'admin') {
    console.log(`Akses ditolak: ${userRole} mencoba akses halaman admin`)
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
    <RoleProtected allowedRoles={['admin']}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <StatsContainer />
        <ChartsContainer />
        <UserTable />
      </HydrationBoundary>
    </RoleProtected>
  )
}
export default StatsPage

// // The new version of the code calls the `getStatsAction` function to fetch the stats data from the server.
