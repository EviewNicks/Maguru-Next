// lib/auth-utils.ts
import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import * as Sentry from '@sentry/nextjs'

export async function getCurrentUser() {
  try {
    const { userId } = await auth()
    if (!userId) return null

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    })

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Function for client components
export async function fetchUser() {
  try {
    const response = await fetch('/api/auth/user')
    if (!response.ok) {
      throw new Error('Failed to fetch user')
    }
    const data = await response.json()
    return data.user
  } catch (error) {
    console.error('Error in createOrGetUser:', error)
    return null
  }
}

export async function createUserIfNotExists() {
  try {
    const user = await currentUser()
    if (!user) return null

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id },
    })

    if (existingUser) return existingUser

    // Create new user
    return await prisma.user.create({
      data: {
        clerkUserId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: 'mahasiswa',
        status: 'active',
      },
    })
  } catch (error) {
    console.error('Error in createUserIfNotExists:', error)
    return null
  }
}

/**
 * Helper function untuk mendapatkan role dari berbagai format
 * Mendukung backward compatibility dengan format lama
 * @param user Object user dari berbagai sumber (Clerk, DB, dll)
 * @returns Role dalam format string
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getRoleWithCompat(user: any): string {
  if (!user) {
    return 'mahasiswa' // Default fallback
  }

  // Format 1: publicMetadata dari Clerk
  if (user.publicMetadata?.role) {
    // Log deprecation warning jika menggunakan format lama
    Sentry.addBreadcrumb({
      category: 'roles',
      message: 'Using deprecated role format: publicMetadata.role',
      level: 'warning',
    })

    return user.publicMetadata.role as string
  }

  // Format 2: metaData (format lama)
  if (user.metaData?.role) {
    // Log deprecation warning jika menggunakan format lama
    Sentry.addBreadcrumb({
      category: 'roles',
      message: 'Using deprecated role format: metaData.role',
      level: 'warning',
    })

    return user.metaData.role as string
  }

  // Format 3: property role langsung (format baru)
  if (user.role) {
    return user.role as string
  }

  // Default fallback
  return 'mahasiswa'
}

/**
 * Helper function untuk memeriksa apakah role termasuk dalam daftar role yang diizinkan
 * @param role Role yang diperiksa
 * @param allowedRoles Array role yang diizinkan
 * @returns Boolean apakah role diizinkan
 */
export function isRoleAuthorized(
  role: string,
  allowedRoles: string[]
): boolean {
  return allowedRoles.includes(role)
}

/**
 * Helper function untuk menambahkan warning deprecation pada response
 * Digunakan untuk memberitahu client bahwa format role yang digunakan akan segera dihentikan
 * @param response Response object
 * @returns Response dengan warning jika diperlukan
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function addRoleDeprecationWarning(response: any): any {
  // Deteksi jika menggunakan format lama
  const isUsingLegacyFormat =
    response.user?.publicMetadata?.role !== undefined ||
    response.user?.metaData?.role !== undefined

  // Jika menggunakan format lama, tambahkan warning
  if (isUsingLegacyFormat) {
    return {
      ...response,
      _warning:
        'DEPRECATED: Using role from Clerk metadata will be discontinued on 7 July 2024',
      _migration: 'Please migrate to using role directly from user object',
    }
  }

  // Jika sudah menggunakan format baru, kembalikan response apa adanya
  return response
}
