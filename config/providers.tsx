'use client'

import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './theme-provider'
import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { Provider } from 'react-redux'
import { store } from '@/store/store'

function InitUser() {
  const { isLoaded, userId } = useAuth()
  const [hasSynced, setHasSynced] = useState(false)

  // Effect untuk memastikan user tersimpan di database
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
          // Coba lagi setelah jeda singkat (mungkin perlu waktu untuk user tersimpan di database)
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
          }, 1000) // Tunggu 1 detik sebelum mencoba lagi
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

  return null
}

function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 menit
            retry: 1,
          },
        },
      })
  )

  return (
    <ClerkProvider
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/"
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
