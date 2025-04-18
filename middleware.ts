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
