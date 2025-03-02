// lib/validations/user.ts
import { z } from 'zod'

export const UserRoleEnum = z.enum(['admin', 'mahasiswa', 'dosen'])
export const UserStatusEnum = z.enum(['active', 'inactive', 'pending'])

export const updateUserSchema = z.object({
  role: UserRoleEnum.optional(),
  status: UserStatusEnum,
})

export const getUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: 'Page must be a valid number',
    }),
  limit: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: 'Limit must be a valid number',
    }),
  search: z.string().optional(),
  role: UserRoleEnum.optional(),
  status: UserStatusEnum.optional(),
})

// Type inference
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>
