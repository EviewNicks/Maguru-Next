import { redirect } from 'next/navigation'
import WelcomeHero from '@/features/user-dashboard/components/WelcomeHero'
import { auth, currentUser } from '@clerk/nextjs/server'

// Interface untuk metadata Clerk
interface ClerkMetadata {
  role?: string
}

export default async function UserDashboard() {
  const authData = await auth()
  const user = await currentUser()

  // Jika user tidak login, redirect ke homepage
  if (!authData.userId) {
    redirect('/')
  }

  // Jika user role adalah admin, redirect ke admin dashboard
  const role = (authData.sessionClaims?.metadata as ClerkMetadata)?.role
  if (role === 'admin') {
    redirect('/(admin)/manage-users')
  }

  // Mendapatkan nama pengguna dari clerk
  const userName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined
    : undefined

  return (
    <div className="container mx-auto px-4 py-12">
      <WelcomeHero userName={userName} />
    </div>
  )
}
