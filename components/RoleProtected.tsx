'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface RoleProtectedProps {
  children: React.ReactNode
  allowedRoles: string[]
}

export default function RoleProtected({
  children,
  allowedRoles,
}: RoleProtectedProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    async function checkRole() {
      try {
        const response = await fetch('/api/auth/role')
        const data = await response.json()

        if (!data.success || !allowedRoles.includes(data.user.role)) {
          setIsAuthorized(false)
          router.push('/unauthorized')
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error('Error checking role:', error)
        setIsAuthorized(false)
        router.push('/unauthorized')
      }
    }

    checkRole()
  }, [allowedRoles, router])

  if (isAuthorized === null) {
    // Loading state
    return <div>Loading...</div>
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
