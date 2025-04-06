'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './theme-provider'
import { useState } from 'react'
import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import { useEffect } from 'react'

function InitUser() {
  const { isLoaded, userId } = useAuth()

  useEffect(() => {
    async function syncUser() {
      if (!isLoaded || !userId) return

      try {
        // Panggil API untuk menyinkronkan pengguna di database lokal
        const userResponse = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clerkUserId: userId,
          }),
        })

        if (!userResponse.ok) {
          const error = await userResponse.json()
          throw new Error(error.message || 'Failed to sync user')
        }

        // Sinkronkan metadata Clerk dengan data di database
        const metadataResponse = await fetch('/api/users/sync-metadata', {
          method: 'GET',
        })

        if (!metadataResponse.ok) {
          console.error('Metadata sync failed:', await metadataResponse.json())
        } else {
          console.log('Metadata synced successfully')
          // Muat ulang halaman agar perubahan metadata segera terlihat
          window.location.reload()
        }
      } catch (error) {
        console.error('Error syncing user:', error)
      }
    }

    syncUser()
  }, [isLoaded, userId])

  return null
}

function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  )

  return (
    <ClerkProvider
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/sign-up"
      signInFallbackRedirectUrl="/user-dashboard"
      signUpFallbackRedirectUrl="/user-dashboard"
    >
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <InitUser />
            {children}
          </ThemeProvider>
        </QueryClientProvider>
      </Provider>
    </ClerkProvider>
  )
}
export default Providers
