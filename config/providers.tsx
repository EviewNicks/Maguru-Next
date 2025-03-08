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

      console.log('Attempting to sync user with ID:', userId)

      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clerkUserId: userId,
          }),
        })

        const data = await response.json()
        console.log('Sync response:', data)

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to sync user')
        }

        console.log('User synced successfully')
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
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
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
