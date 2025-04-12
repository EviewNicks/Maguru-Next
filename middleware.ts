import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse, type NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

// Rute publik yang dapat diakses tanpa autentikasi
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/unauthorized',
  '/verify(.*)',
  '/module(.*)',
  '/team/new',
  '/api/webhooks(.*)',
  '/quiz(.*)',
])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  try {
    const { response } = await handleRequest(auth, req)
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next({
      request: {
        headers: req.headers,
      },
    })
  }
})

// Menggunakan tipe "any" dengan komentar untuk menjelaskan alasannya
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleRequest(auth: any, req: NextRequest) {
  // Jika URL adalah rute publik, izinkan akses
  if (isPublicRoute(req)) {
    return { response: NextResponse.next() }
  }

  // Jika tidak memiliki sesi dan bukan rute publik, redirect ke halaman unauthorized
  if (!auth.userId) {
    const unauthorizedUrl = new URL('/unauthorized', req.url)
    return { response: NextResponse.redirect(unauthorizedUrl) }
  }

  try {
    // Periksa peran pengguna untuk akses admin
    if (req.nextUrl.pathname.startsWith('/manage-users')) {
      const user = await prisma.user.findUnique({
        where: { clerkUserId: auth.userId },
        select: { role: true },
      })

      if (!user?.role || user.role !== 'admin') {
        console.log('Access denied: User is not admin', {
          userId: auth.userId,
          role: user?.role,
        })
        const unauthorizedUrl = new URL('/unauthorized', req.url)
        return { response: NextResponse.redirect(unauthorizedUrl) }
      }
    }

    // Set role di header untuk digunakan di server components
    const response = NextResponse.next()
    if (auth.userId) {
      const user = await prisma.user.findUnique({
        where: { clerkUserId: auth.userId },
        select: { role: true },
      })
      response.headers.set('x-user-role', user?.role || '')
    }

    return { response }
  } catch (error) {
    console.error('Error saat mengambil role dari database:', error)
    return { response: NextResponse.next() }
  }
}

export const config = {
  matcher: [
    // Order matters
    // Exclude static assets
    '/((?!.+\\.[\\w]+$|_next).*)',
    // Exclude common file types
    '/((?!favicon.ico|robots.txt).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
