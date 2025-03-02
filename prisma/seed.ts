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
      },
      {
        clerkUserId: 'user_3gZ4...',
        email: 'user2@example.com',
        name: 'Jane Smith',
        role: 'mahasiswa',
      },
      {
        clerkUserId: 'user_4hX5...',
        email: 'user3@example.com',
        name: 'Alice Johnson',
        role: 'dosen',
      },
      {
        clerkUserId: 'user_5iY6...',
        email: 'user4@example.com',
        name: 'Bob Brown',
        role: 'mahasiswa',
      },
      {
        clerkUserId: 'user_6jZ7...',
        email: 'user5@example.com',
        name: 'Charlie Williams',
        role: 'admin',
      },
      {
        clerkUserId: 'user_7kX8...',
        email: 'user6@example.com',
        name: 'David Miller',
        role: 'mahasiswa',
      },
      {
        clerkUserId: 'user_8lY9...',
        email: 'user7@example.com',
        name: 'Eve Davis',
        role: 'dosen',
      },
      {
        clerkUserId: 'user_9mZ0...',
        email: 'user8@example.com',
        name: 'Frank Wilson',
        role: 'mahasiswa',
      },
      {
        clerkUserId: 'user_A1B2...',
        email: 'user9@example.com',
        name: 'Grace Lee',
        role: 'admin',
      },
      {
        clerkUserId: 'user_C3D4...',
        email: 'user10@example.com',
        name: 'Hannah White',
        role: 'mahasiswa',
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
