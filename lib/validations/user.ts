// lib/validations/user.ts

export const UserRoleEnum = z.enum(["admin", "mahasiswa", "dosen"])
export const UserStatusEnum = z.enum(["active", "inactive", "pending"])

export const updateUserSchema = z.object({
  role: UserRoleEnum.optional(),
  status: UserStatusEnum,
})

export const getUsersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  role: UserRoleEnum.optional(),
  status: UserStatusEnum.optional(),
})

// Type inference
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>