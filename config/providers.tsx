'use client'

import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './theme-provider'
import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import { useSearchParams } from 'next/navigation'

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

export function Providers({ children }: { children: React.ReactNode }) {
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

  const [shouldReload, setShouldReload] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Cek parameter reload_session
    const reloadSession = searchParams.get('reload_session')
    if (reloadSession === 'true') {
      setShouldReload(true)
      // Hapus parameter dari URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [searchParams])

  useEffect(() => {
    if (shouldReload) {
      window.location.reload()
    }
  }, [shouldReload])

  return (
    <ClerkProvider
      afterSignInUrl="/"
      afterSignUpUrl="/"
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
