import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/**
 * Mendefinisikan rute-rute publik yang dapat diakses tanpa autentikasi
 */
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/unauthorized',
  '/verify(.*)',
  '/api/webhooks(.*)',
])

/**
 * Mendefinisikan rute-rute yang membutuhkan role admin
 */
const isAdminRoute = createRouteMatcher(['/admin(.*)'])

// Tipe untuk metadata Auth0
interface Auth0Metadata {
  role?: string
  [key: string]: unknown
}

/**
 * Memeriksa apakah pengguna memiliki peran admin
 */
function hasAdminRole(metadata: Auth0Metadata | null | undefined): boolean {
  return metadata?.role === 'admin'
}

/**
 * Middleware Clerk untuk mengelola autentikasi dan otorisasi
 *
 * Alur kerja:
 * 1. Memeriksa apakah rute adalah rute publik, jika ya biarkan akses
 * 2. Jika bukan rute publik, memeriksa apakah user sudah login, jika tidak redirect ke login
 * 3. Untuk rute admin, memeriksa apakah user memiliki role admin, jika tidak redirect ke unauthorized
 */
export default clerkMiddleware(
  async (auth, req) => {
    try {
      // Dapatkan data autentikasi user
      const session = await auth()

      // Jika rute publik, izinkan akses
      if (isPublicRoute(req)) {
        return NextResponse.next()
      }

      // Jika user belum login dan bukan rute publik, redirect ke sign-in
      if (!session.userId) {
        const signInUrl = new URL('/sign-in', req.url)
        signInUrl.searchParams.set('redirect_url', req.url)
        return NextResponse.redirect(signInUrl)
      }

      // Pemeriksaan untuk rute admin
      if (isAdminRoute(req)) {
        // Pemeriksaan role dari session metadata
        const metadata = session.sessionClaims?.metadata as
          | Auth0Metadata
          | undefined

        if (!hasAdminRole(metadata)) {
          // Redirect ke halaman unauthorized jika bukan admin
          const unauthorizedUrl = new URL('/unauthorized', req.url)
          return NextResponse.redirect(unauthorizedUrl)
        }
      }

      // Jika semua pemeriksaan berhasil, lanjutkan request
      return NextResponse.next()
    } catch (error) {
      console.error('Middleware error:', error)
      // Pada kasus error, tetap izinkan request untuk menghindari blocking
      return NextResponse.next()
    }
  },
  {
    // Aktifkan debugging pada lingkungan development
    debug: process.env.NODE_ENV === 'development',
  }
)

/**
 * Konfigurasi matcher untuk middleware
 * - Mengabaikan aset statis
 * - Selalu menjalankan untuk rute API
 */
export const config = {
  matcher: [
    // Skip Next.js internals dan semua file statis
    '/((?!_next|[^?]*\\.(html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Selalu jalankan untuk rute API
    '/(api|trpc)(.*)',
  ],
}
