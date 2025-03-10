// __tests__/__mocks__/@prisma/client.ts
export const PrismaClient = jest.fn().mockImplementation(() => ({
  module: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({})
  },
  $connect: jest.fn(),
  $disconnect: jest.fn()
}));