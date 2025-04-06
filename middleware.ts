import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Rute publik yang dapat diakses tanpa autentikasi
const isPublicRoute = createRouteMatcher([
  '/',
  '/products(.*)',
  '/about',
  '/auth(.*)',
  '/api/webhooks/clerk(.*)', // Pastikan webhook Clerk tidak terblokir
])

// Rute API yang perlu diakses tanpa redirect
const isApiRoute = createRouteMatcher(['/api/users(.*)', '/api/module(.*)'])

// Rute yang hanya dapat diakses oleh admin
const isAdminRoute = createRouteMatcher(['/(admin)(.*)', '/manage-users(.*)'])

// Rute yang hanya dapat diakses oleh mahasiswa
const isStudentRoute = createRouteMatcher([
  '/user-dashboard(.*)',
  '/module(.*)',
  '/quiz(.*)',
])

export default clerkMiddleware(
  async (auth, request) => {
    // Periksa jika ini adalah permintaan API - izinkan melewati
    if (
      isApiRoute(request) &&
      !request.nextUrl.pathname.startsWith('/api/webhooks')
    ) {
      return NextResponse.next()
    }

    // Mengambil informasi autentikasi
    const session = await auth()
    const userId = session.userId

    if (!userId) {
      // Jika bukan rute publik dan tidak ada sesi, redirect ke login
      if (!isPublicRoute(request)) {
        console.log('Redirecting to login - No session')
        return NextResponse.redirect(new URL('/auth/sign-in', request.url))
      }
      return NextResponse.next()
    }

    // Dapatkan role pengguna dari metadata Clerk
    let userRole = (session.sessionClaims?.metadata as { role?: string })?.role

    // Jika role tidak ditemukan di metadata, ambil dari database
    if (!userRole) {
      console.log('Role tidak ditemukan di metadata, mencoba dari database...')
      try {
        const userFromDb = await prisma.user.findUnique({
          where: { clerkUserId: userId },
          select: { role: true },
        })

        if (userFromDb) {
          userRole = userFromDb.role
          console.log('Role dari database:', userRole)
        } else {
          console.log(
            'User tidak ditemukan di database, menggunakan default: mahasiswa'
          )
          userRole = 'mahasiswa'
        }
      } catch (error) {
        console.error('Error saat mengambil role dari database:', error)
        userRole = 'mahasiswa'
      }
    }

    // Logging untuk debugging
    console.log('Middleware Debug:')
    console.log('User ID:', userId)
    console.log('User Role:', userRole)
    console.log('Current Path:', request.nextUrl.pathname)
    console.log(
      'Session Claims:',
      JSON.stringify(session.sessionClaims, null, 2)
    )

    // Redirect berdasarkan role
    if (userId) {
      // Redirect admin ke manage-users
      if (userRole === 'admin' && request.nextUrl.pathname === '/') {
        console.log('Redirecting admin to /manage-users')
        return NextResponse.redirect(new URL('/manage-users', request.url))
      }

      // Redirect mahasiswa ke user-dashboard
      if (userRole === 'mahasiswa' && request.nextUrl.pathname === '/') {
        console.log('Redirecting mahasiswa to /user-dashboard')
        return NextResponse.redirect(new URL('/user-dashboard', request.url))
      }

      // Proteksi rute admin
      if (isAdminRoute(request) && userRole !== 'admin') {
        console.log('Blocking admin route access')
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      // Proteksi rute mahasiswa
      if (isStudentRoute(request) && userRole !== 'mahasiswa') {
        console.log('Blocking student route access')
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    return NextResponse.next()
  },
  {
    // Aktifkan debug logging
    debug: false,
  }
)

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
