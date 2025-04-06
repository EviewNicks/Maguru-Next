'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './theme-provider'
import { useState } from 'react'
import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

// Konstanta untuk mengontrol waktu dan batas percobaan
const MAX_RELOAD_ATTEMPTS = 3 // Maksimal 3 kali reload
const RELOAD_DELAY = 1000 // 1 detik delay

function InitUser() {
  const { isLoaded, userId } = useAuth()
  const [hasSynced, setHasSynced] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [shouldReload, setShouldReload] = useState(false)
  const searchParams = useSearchParams()
  const needsReload = searchParams?.get('reload_session') === 'true'
  const reloadCount = parseInt(searchParams?.get('reload_count') || '0')

  useEffect(() => {
    // Jika parameter URL reload_session=true, tetapi sudah mencapai batas maksimum, jangan reload
    if (needsReload) {
      console.log(
        `Detected reload_session parameter (attempt ${reloadCount + 1} of ${MAX_RELOAD_ATTEMPTS})`
      )

      if (reloadCount >= MAX_RELOAD_ATTEMPTS) {
        console.log('Maximum reload attempts reached. Stopping reload cycle.')

        // Hapus parameter reload_session dari URL tanpa reload
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('reload_session')
        newUrl.searchParams.delete('reload_count')
        window.history.replaceState({}, '', newUrl.toString())
        return
      }

      // Hapus parameter reload_session dari URL dan tambahkan/update reload_count
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('reload_session')
      newUrl.searchParams.set('reload_count', (reloadCount + 1).toString())
      window.history.replaceState({}, '', newUrl.toString())

      // Reload halaman setelah parameter diperbarui, dengan delay lebih lama
      const timer = setTimeout(() => {
        console.log(
          `Reloading page to update session (attempt ${reloadCount + 1} of ${MAX_RELOAD_ATTEMPTS})...`
        )
        window.location.reload()
      }, RELOAD_DELAY)
      return () => clearTimeout(timer)
    } else if (reloadCount > 0) {
      // Jika ada reload_count tapi tidak ada reload_session, berarti kita baru selesai reload
      // Hapus parameter reload_count dari URL tanpa reload
      console.log('Cleanup after reload cycle')
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('reload_count')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [needsReload, reloadCount])

  useEffect(() => {
    async function syncUser() {
      if (!isLoaded || !userId || hasSynced) return

      try {
        console.log('Starting user sync process...')

        // Cek apakah pengguna sudah ada dalam database
        const checkUserResponse = await fetch(
          `/api/users?clerkUserId=${userId}`,
          {
            method: 'GET',
          }
        )

        const checkUserData = await checkUserResponse.json()
        const userExists = checkUserData.users && checkUserData.users.length > 0

        if (userExists) {
          console.log('User exists in database:', checkUserData.users[0])
        } else {
          console.log('User does not exist in database, creating new user')
          setIsNewUser(true)
        }

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

        const userData = await userResponse.json()
        console.log('User synced with database:', userData)

        // Sinkronkan metadata Clerk dengan data di database
        const metadataResponse = await fetch('/api/users/sync-metadata', {
          method: 'GET',
        })

        if (!metadataResponse.ok) {
          console.error('Metadata sync failed:', await metadataResponse.json())
        } else {
          const metadataResult = await metadataResponse.json()
          console.log('Metadata synced successfully:', metadataResult)

          // Tandai bahwa sinkronisasi telah dilakukan
          setHasSynced(true)

          // Semua pengguna baru harus reload, tapi hanya jika belum mencapai batas maksimum
          if (isNewUser && reloadCount < MAX_RELOAD_ATTEMPTS) {
            console.log(
              'New user detected, will reload page to update session...'
            )
            setShouldReload(true)
          }
          // Untuk pengguna yang sudah ada, periksa apakah ada perbedaan metadata dan belum mencapai batas
          else if (
            metadataResult &&
            metadataResult.results &&
            metadataResult.results.length > 0 &&
            reloadCount < MAX_RELOAD_ATTEMPTS
          ) {
            console.log(
              'Session metadata may need updating, will reload page...'
            )
            setShouldReload(true)
          } else {
            console.log('No need to reload or already reached maximum attempts')
          }
        }
      } catch (error) {
        console.error('Error syncing user:', error)
      }
    }

    syncUser()
  }, [isLoaded, userId, hasSynced, isNewUser, reloadCount])

  // Effect terpisah untuk reload halaman
  useEffect(() => {
    if (shouldReload) {
      console.log('Preparing to reload page to update session...')
      // Gunakan timeout untuk memastikan semua log tercetak dan tambahkan delay lebih lama
      const timer = setTimeout(() => {
        // Untuk reload yang lebih reliabel, gunakan parameter URL alih-alih langsung reload
        const url = new URL(window.location.href)
        url.searchParams.set('reload_session', 'true')
        window.location.href = url.toString()
      }, RELOAD_DELAY)
      return () => clearTimeout(timer)
    }
  }, [shouldReload])

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
      signInFallbackRedirectUrl="/manage-users"
      signUpFallbackRedirectUrl="/manage-users"
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
