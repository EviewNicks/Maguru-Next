// features/manage-module/schemas/moduleSchema.ts
import { z } from 'zod';
import { ModuleStatus } from '../types';

// Schema untuk validasi input pembuatan modul
export const ModuleCreateSchema = z.object({
  title: z
    .string()
    .min(5, 'Judul minimal 5 karakter')
    .max(100, 'Judul maksimal 100 karakter'),
  description: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional(),
  status: z.nativeEnum(ModuleStatus).default(ModuleStatus.DRAFT),
  createdBy: z.string().min(1, 'CreatedBy is required'),
});

// Schema untuk validasi input pembaruan modul
export const ModuleUpdateSchema = z.object({
  title: z
    .string()
    .min(5, 'Judul minimal 5 karakter')
    .max(100, 'Judul maksimal 100 karakter')
    .optional(),
  description: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional(),
  status: z.nativeEnum(ModuleStatus).optional(),
  updatedBy: z.string().min(1, 'UpdatedBy is required'),
});

// Schema untuk validasi query parameter
export const GetModulesSchema = z.object({
  status: z.nativeEnum(ModuleStatus).optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  cursor: z.string().optional(),
  search: z.string().optional(),
});

// Type inferensi dari schema
export type ModuleCreateInput = z.infer<typeof ModuleCreateSchema>;
export type ModuleUpdateInput = z.infer<typeof ModuleUpdateSchema>;
export type GetModulesOptions = z.infer<typeof GetModulesSchema>;
