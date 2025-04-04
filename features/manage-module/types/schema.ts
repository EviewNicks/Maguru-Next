import { z } from 'zod'
import { ModuleStatus } from '.'

/**
 * Skema validasi untuk form modul
 */
export const moduleFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Judul minimal 5 karakter')
    .max(100, 'Judul maksimal 100 karakter'),
  description: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  status: z.nativeEnum(ModuleStatus).default(ModuleStatus.DRAFT),
})

export type ModuleFormValues = z.infer<typeof moduleFormSchema>
