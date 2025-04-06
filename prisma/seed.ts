import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.user.createMany({
    data: [
      {
        clerkUserId: 'user_2fY3...',
        email: 'user1@example.com',
        name: 'John Doe',
        role: 'admin',
        status: 'active'
      },
      {
        clerkUserId: 'user_3gZ4...',
        email: 'user2@example.com',
        name: 'Jane Smith',
        role: 'mahasiswa',
        status: 'active'
      },
      {
        clerkUserId: 'user_4hX5...',
        email: 'user3@example.com',
        name: 'Alice Johnson',
        role: 'mahasiswa',
        status: 'active'
      },
      {
        clerkUserId: 'user_5iY6...',
        email: 'user4@example.com',
        name: 'Bob Brown',
        role: 'mahasiswa',
        status: 'inactive'
      }
    ]
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
