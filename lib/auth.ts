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
