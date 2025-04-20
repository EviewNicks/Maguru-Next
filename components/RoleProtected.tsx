'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'

interface RoleProtectedProps {
  children: React.ReactNode
  allowedRoles: string[]
}

export default function RoleProtected({
  children,
  allowedRoles,
}: RoleProtectedProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    async function checkRole() {
      try {
        // Tambahkan cache-busting query parameter
        const response = await fetch(`/api/auth/role?_=${new Date().getTime()}`, {
          cache: 'no-store',
          headers: {
            'x-pathname': pathname || '',
          },
        })
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
  }, [allowedRoles, router, pathname])

  if (isAuthorized === null) {
    // Loading state
    return <div>Loading...</div>
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
