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
    console.log('createOrGetUser dipanggil')
    const { userId } = await auth()
    if (!userId) return null
    console.log('userId dari Clerk:', userId)

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    })

    console.log('User dari database:', user)

    // If user doesn't exist, create new user directly with Prisma
    if (!user) {
      const clerkUser = await currentUser()
      console.log('Data dari Clerk:', clerkUser)
      if (!clerkUser) return null

      user = await prisma.user.create({
        data: {
          clerkUserId: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
          role: 'mahasiswa',
          status: 'active',
        },
      })
      console.log('User baru dibuat:', user)
    }
    return user
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
