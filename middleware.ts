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
const isAdminRoute = createRouteMatcher(['/(admin)(.*)', '/manage-users(.*)'])

// Rute yang hanya dapat diakses oleh mahasiswa
const isStudentRoute = createRouteMatcher([
  '/user-dashboard(.*)',
  '/module(.*)',
  '/quiz(.*)',
])

interface ClerkMetadata {
  role?: string
  status?: string
  userId?: string
}

// Konstanta untuk mengontrol batas percobaan
const MAX_RELOAD_ATTEMPTS = 3 // Maksimal 3 kali reload

export default clerkMiddleware(async (auth, request) => {
  // Mengambil informasi autentikasi
  const session = await auth()
  const userId = session.userId

  // Ambil public metadata dari session
  const metadata = (session.sessionClaims?.metadata as ClerkMetadata) || {}

  // Dapatkan role pengguna - defaultkan ke mahasiswa jika tidak ada
  // Menggunakan pola yang sama dengan LinksDropdown.tsx
  const userRole = metadata.role || 'mahasiswa'

  // Periksa apakah kita sudah berada dalam siklus reload
  const reloadCount = parseInt(
    request.nextUrl.searchParams.get('reload_count') || '0'
  )

  // Jika metadatanya kosong atau tidak lengkap namun userId ada,
  // kemungkinan sesi belum terupdate dengan metadata terbaru
  if (userId && (!metadata.role || !metadata.userId)) {
    // Hanya tambahkan search param jika belum mencapai batas maksimum dan bukan request API
    if (
      !request.nextUrl.pathname.includes('api') &&
      !request.nextUrl.searchParams.has('reload_session') &&
      reloadCount < MAX_RELOAD_ATTEMPTS
    ) {
      const redirectUrl = new URL(request.nextUrl.pathname, request.url)
      redirectUrl.searchParams.set('reload_session', 'true')

      // Pertahankan parameter reload_count jika sudah ada
      if (reloadCount > 0) {
        redirectUrl.searchParams.set('reload_count', reloadCount.toString())
      }
      return NextResponse.redirect(redirectUrl)
    } else if (reloadCount >= MAX_RELOAD_ATTEMPTS) {
      console.log(
        `Middleware - Maximum reload attempts reached for user: ${userId}. Continuing without redirect.`
      )
    }
  }

  // Jika rute publik, izinkan akses tanpa autentikasi
  if (isPublicRoute(request)) {
    return NextResponse.next()
  }

  // Jika belum login dan mencoba mengakses rute terlindungi
  if (!userId && !isPublicRoute(request)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Jika pengguna mengakses rute admin tetapi bukan admin
  // Menggunakan pola yang sama dengan LinksDropdown untuk memeriksa role
  if (isAdminRoute(request) && userRole !== 'admin') {
    console.log(
      `Middleware - Access denied to admin route for user with role: ${userRole}`
    )

    // Redirect ke halaman dashboard mahasiswa jika ia adalah mahasiswa
    if (userRole === 'mahasiswa') {
      return NextResponse.redirect(new URL('/user-dashboard', request.url))
    }

    // Jika role tidak diketahui atau tidak valid, redirect ke homepage
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Jika pengguna mengakses rute mahasiswa tetapi adalah admin
  if (isStudentRoute(request) && userRole === 'admin') {
    console.log(
      `Middleware - Redirecting admin from student route to admin route`
    )
    return NextResponse.redirect(new URL('/manage-users', request.url))
  }

  // Penanganan login pertama kali - arahkan pengguna ke halaman yang sesuai
  if (userId) {
    // Jika user sudah login dan mencoba mengakses homepage, arahkan sesuai role
    if (request.nextUrl.pathname === '/') {
      // Gunakan userRole yang sudah didapatkan dari metadata
      if (userRole === 'admin') {
        console.log(
          `Middleware - Redirecting admin from homepage to admin dashboard`
        )
        return NextResponse.redirect(new URL('/manage-users', request.url))
      } else {
        console.log(
          `Middleware - Redirecting student from homepage to user dashboard`
        )
        return NextResponse.redirect(new URL('/user-dashboard', request.url))
      }
    }

    // Jika user admin mengakses rute selain admin route dan public route,
    // redirect ke halaman admin dashboard
    if (
      userRole === 'admin' &&
      !isAdminRoute(request) &&
      !isPublicRoute(request) &&
      !request.nextUrl.pathname.includes('api')
    ) {
      console.log(
        `Middleware - Redirecting admin to admin dashboard from non-admin route`
      )
      return NextResponse.redirect(new URL('/manage-users', request.url))
    }

    // Jika user mahasiswa mengakses halaman selain student route dan public route,
    // redirect ke halaman user dashboard
    if (
      userRole === 'mahasiswa' &&
      !isStudentRoute(request) &&
      !isPublicRoute(request) &&
      !request.nextUrl.pathname.includes('api')
    ) {
      console.log(
        `Middleware - Redirecting student to user dashboard from non-student route`
      )
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
