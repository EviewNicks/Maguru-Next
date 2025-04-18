'use client'

import { useState, useEffect, Suspense } from 'react'
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
        // Mulai proses sinkronisasi user

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
          // Coba lagi setelah jeda singkat (mungkin perlu waktu untuk user tersimpan di database)
          setTimeout(async () => {
            try {
              const retryResponse = await fetch('/api/users/sync-metadata', {
                method: 'POST',
              })
              if (!retryResponse.ok) {
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
        }

        setHasSynced(true)
      } catch (error) {
        console.error('Error saat sinkronisasi user:', error)
      }
    }

    syncUserWithDatabase()
  }, [isLoaded, userId, hasSynced])

  return null
}

// Komponen untuk menangani search params dengan Suspense
function SearchParamsHandler({
  setParamsCallback,
}: {
  setParamsCallback: (hasReloadParam: boolean) => void
}) {
  const searchParams = useSearchParams()

  useEffect(() => {
    // Cek parameter reload_session
    const reloadSession = searchParams
      ? searchParams.get('reload_session')
      : null
    setParamsCallback(reloadSession === 'true')

    if (reloadSession === 'true') {
      // Hapus parameter dari URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [searchParams, setParamsCallback])

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

  useEffect(() => {
    if (shouldReload) {
      window.location.reload()
    }
  }, [shouldReload])

  const handleParams = (hasReloadParam: boolean) => {
    setShouldReload(hasReloadParam)
  }

  // Gunakan publishableKey dari environment variable
  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    'pk_test_ZXhvdGljLWdhemVsbGUtNjAuY2xlcmsuYWNjb3VudHMuZGV2JA'

  return (
    <ClerkProvider
      publishableKey={publishableKey}
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
            <Suspense fallback={null}>
              <SearchParamsHandler setParamsCallback={handleParams} />
            </Suspense>
            {children}
          </ThemeProvider>
        </QueryClientProvider>
      </Provider>
    </ClerkProvider>
  )
}

export default Providers
