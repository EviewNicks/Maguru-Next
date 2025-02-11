// hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { getCurrentUser } from '@/lib/auth'
import type { User } from '@prisma/client'

export function useAuth() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      if (clerkLoaded && clerkUser) {
        const dbUser = await getCurrentUser()
        setUser(dbUser)
      }
      setIsLoading(false)
    }

    loadUser()
  }, [clerkUser, clerkLoaded])

  return {
    user,
    isLoading: isLoading || !clerkLoaded,
    clerkUser,
  }
}
