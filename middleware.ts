import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createOrGetUser } from './lib/auth'

const isPublicRoute = createRouteMatcher(['/', '/products(.*)', '/about'])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }

  // Bypass user check for user creation
  if (request.method === 'POST' && request.url.endsWith('/api/users')) {
    return NextResponse.next()
  }

  // Only try to create/get user for API routes or pages that need user data
  if (request.url.includes('/api/') || request.url.includes('/dashboard')) {
    const user = await createOrGetUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
