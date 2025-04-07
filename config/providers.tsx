'use client'

import { useState, useEffect, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './theme-provider'
import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import { useSearchParams } from 'next/navigation'

function InitUserContent() {
  const { isLoaded, userId } = useAuth()
  const [hasSynced, setHasSynced] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    async function syncUserWithDatabase() {
      if (!isLoaded || !userId || hasSynced) return

      try {
        console.log('Mulai proses sinkronisasi user...')

        // Simpan user ke database
        const userResponse = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clerkUserId: userId }),
        })

        if (!userResponse.ok) {
          throw new Error('Gagal menyimpan user')
        }

        // Juga sinkronkan metadata
        const metadataResponse = await fetch('/api/users/sync-metadata', {
          method: 'POST',
        })

        if (!metadataResponse.ok) {
          console.warn('Gagal sinkronisasi metadata, mencoba lagi...')
          setTimeout(async () => {
            try {
              const retryResponse = await fetch('/api/users/sync-metadata', {
                method: 'POST',
              })
              if (retryResponse.ok) {
                console.log(
                  'Sinkronisasi metadata berhasil pada percobaan kedua'
                )
              } else {
                console.error(
                  'Gagal sinkronisasi metadata pada percobaan kedua'
                )
              }
            } catch (retryError) {
              console.error(
                'Error saat retry sinkronisasi metadata:',
                retryError
              )
            }
          }, 1000)
        } else {
          console.log('Sinkronisasi metadata berhasil')
        }

        console.log('User berhasil disimpan dan disinkronkan')
        setHasSynced(true)
      } catch (error) {
        console.error('Error saat sinkronisasi user:', error)
      }
    }

    syncUserWithDatabase()
  }, [isLoaded, userId, hasSynced])

  useEffect(() => {
    const reloadSession = searchParams.get('reload_session')
    if (reloadSession === 'true') {
      window.history.replaceState({}, '', window.location.pathname)
      window.location.reload()
    }
  }, [searchParams])

  return null
}

function InitUser() {
  return (
    <Suspense fallback={null}>
      <InitUserContent />
    </Suspense>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  )

  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'bg-sky-500 hover:bg-sky-600',
          footerActionLink: 'text-sky-500 hover:text-sky-600',
        },
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
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
