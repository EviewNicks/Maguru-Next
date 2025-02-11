// lib/auth-utils.ts
import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

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
export async function createOrGetUser() {
  try {
    const { userId } = await auth()
    if (!userId) return null

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    })

    // If user doesn't exist, create new user via API
    if (!user) {
      const clerkUser = await currentUser()
      if (!clerkUser) return null

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkUserId: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
          role: 'mahasiswa',
          status: 'active',
        }),
      })

      if (!response.ok) {
        console.error('Failed to create user:', await response.json())
        return null
      }

      user = await response.json()
    }

    return user
  } catch (error) {
    console.error('Error in createOrGetUser:', error)
    return null
  }
}
