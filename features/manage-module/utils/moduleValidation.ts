import { z } from 'zod';
import { ModuleStatus } from '../types';

/**
 * Skema validasi untuk pembuatan dan pembaruan modul
 */
export const moduleSchema = z.object({
  title: z
    .string()
    .min(5, 'Judul minimal 5 karakter')
    .max(100, 'Judul maksimal 100 karakter'),
  description: z.string().optional(),
  status: z.nativeEnum(ModuleStatus).optional().default(ModuleStatus.DRAFT),
});

/**
 * Skema validasi untuk pembuatan modul (alias untuk moduleSchema)
 */
export const createModuleSchema = moduleSchema;

/**
 * Skema validasi untuk pembaruan modul
 */
export const updateModuleSchema = z.object({
  title: z
    .string()
    .min(5, 'Judul minimal 5 karakter')
    .max(100, 'Judul maksimal 100 karakter')
    .optional(),
  description: z.string().optional(),
  status: z.nativeEnum(ModuleStatus).optional(),
});

/**
 * Skema validasi untuk pembaruan status modul
 */
export const updateModuleStatusSchema = z.object({
  status: z.nativeEnum(ModuleStatus),
});

/**
 * Skema validasi untuk parameter query
 */
export const moduleQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  status: z.nativeEnum(ModuleStatus).optional(),
  search: z.string().optional(),
});

export type ModuleSchemaType = z.infer<typeof moduleSchema>;
export type CreateModuleSchemaType = z.infer<typeof createModuleSchema>;
export type UpdateModuleSchemaType = z.infer<typeof updateModuleSchema>;
export type UpdateModuleStatusSchemaType = z.infer<typeof updateModuleStatusSchema>;
export type ModuleQuerySchemaType = z.infer<typeof moduleQuerySchema>;
