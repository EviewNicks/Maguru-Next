import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.user.createMany({
    data: [
      {
        clerkUserId: 'user_2fY3...',
        email: 'user1@example.com',
        name: 'John Doe',
      },
      {
        clerkUserId: 'user_3gZ4...',
        email: 'user2@example.com',
        name: 'Jane Smith',
      },
    ],
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
