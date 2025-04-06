import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Rute publik yang dapat diakses tanpa autentikasi
const isPublicRoute = createRouteMatcher([
  '/',
  '/products(.*)',
  '/about',
  '/auth(.*)',
])

// Rute yang hanya dapat diakses oleh admin
const isAdminRoute = createRouteMatcher([
  '/(admin)(.*)',
  '/admin-dashboard(.*)',
])

// Rute yang hanya dapat diakses oleh mahasiswa
const isStudentRoute = createRouteMatcher([
  '/user-dashboard(.*)',
  '/module(.*)',
  '/quiz(.*)',
])

interface ClerkMetadata {
  role?: string
  status?: string
}

export default clerkMiddleware(async (auth, request) => {
  // Mengambil informasi autentikasi
  const session = await auth()
  const userId = session.userId

  // Mengambil role dari metadata dengan type casting yang benar
  const metadata = (session.sessionClaims?.metadata as ClerkMetadata) || {}
  const userRole = metadata.role || 'mahasiswa' // Default ke mahasiswa jika tidak ada role

  // Jika rute publik, izinkan akses tanpa autentikasi
  if (isPublicRoute(request)) {
    return NextResponse.next()
  }

  // Jika belum login dan mencoba mengakses rute terlindungi
  if (!userId && !isPublicRoute(request)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Jika pengguna mengakses rute admin tetapi bukan admin
  if (isAdminRoute(request) && userRole !== 'admin') {
    // Redirect ke halaman dashboard mahasiswa jika ia adalah mahasiswa
    if (userRole === 'mahasiswa') {
      return NextResponse.redirect(new URL('/user-dashboard', request.url))
    }
    // Jika role tidak diketahui atau tidak valid, redirect ke homepage
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Jika pengguna mengakses rute mahasiswa tetapi adalah admin
  if (isStudentRoute(request) && userRole === 'admin') {
    return NextResponse.redirect(new URL('/(admin)/manage-users', request.url))
  }

  // Jika pengguna login dan mencoba mengakses homepage, arahkan ke dashboard sesuai role
  if (userId && request.nextUrl.pathname === '/') {
    if (userRole === 'admin') {
      return NextResponse.redirect(
        new URL('/(admin)/manage-users', request.url)
      )
    } else {
      return NextResponse.redirect(new URL('/user-dashboard', request.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
