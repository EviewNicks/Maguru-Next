import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { getRoleFromClaims } from '@/lib/edge-chache'

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
  '/api/admin/set-role',
])

/**
 * Mendefinisikan rute-rute yang membutuhkan role admin
 */
const isAdminRoute = createRouteMatcher(['/admin(.*)'])

/**
 * Middleware Clerk untuk mengelola autentikasi dan otorisasi
 *
 * Alur kerja:
 * 1. Memeriksa apakah rute adalah rute publik, jika ya biarkan akses
 * 2. Jika bukan rute publik, memeriksa apakah user sudah login, jika tidak redirect ke login
 * 3. Untuk rute admin, memeriksa apakah user memiliki role admin melalui cache atau database, jika tidak redirect ke unauthorized
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
        // Gunakan getRoleFromClaims dari edge-cache
        const role = getRoleFromClaims(session.sessionClaims)

        // Log role untuk debugging
        console.log('User role from claims:', role, 'User ID:', session.userId)

        // Periksa role dengan case-insensitive
        if (role?.toLowerCase() !== 'admin') {
          // Redirect ke halaman unauthorized jika bukan admin
          const unauthorizedUrl = new URL('/unauthorized', req.url)
          return NextResponse.redirect(unauthorizedUrl)
        }
      }

      // Jika semua pemeriksaan berhasil, lanjutkan request
      return NextResponse.next()
    } catch (error) {
      // Log error ke Sentry untuk monitoring
      Sentry.captureException(error, {
        tags: { component: 'middleware' },
      })

      // Pada kasus error, tetap izinkan request untuk menghindari blocking
      return NextResponse.next()
    }
  },
  {
    // Nonaktifkan debugging untuk mengurangi log
    debug: false,
  }
)

/**
 * Konfigurasi matcher untuk middleware
 * - Mengabaikan aset statis
 * - Selalu menjalankan untuk rute API
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public file extensions (.svg, .jpg, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|css|ico)).*)',
    '/api/:path*',
  ],
}
