// features/manage-module/schemas/modulePageSchema.ts
import { z } from 'zod';

// Enum untuk tipe konten halaman
export enum ModulePageType {
  TEORI = 'teori',
  KODE = 'kode',
}

// Enum untuk bahasa pemrograman yang didukung
export enum ProgrammingLanguage {
  PYTHON = 'python',
  JAVASCRIPT = 'javascript',
  JAVA = 'java',
  CSHARP = 'csharp',
  PHP = 'php',
  GO = 'go',
  RUBY = 'ruby',
  SWIFT = 'swift',
  KOTLIN = 'kotlin',
  RUST = 'rust',
  SQL = 'sql',
  HTML = 'html',
  CSS = 'css',
}

// Schema untuk validasi input pembuatan halaman modul
// Menggunakan discriminated union untuk validasi berdasarkan tipe
export const ModulePageCreateSchema = z.discriminatedUnion('type', [
  // Schema untuk tipe konten "teori"
  z.object({
    type: z.literal(ModulePageType.TEORI),
    moduleId: z.string().uuid('ModuleId harus berupa UUID yang valid'),
    order: z.number().int().min(0, 'Urutan harus angka non-negatif'),
    content: z
      .string()
      .min(1, 'Konten tidak boleh kosong')
      .max(5000, 'Konten teori maksimal 5000 karakter'),
  }),
  // Schema untuk tipe konten "kode"
  z.object({
    type: z.literal(ModulePageType.KODE),
    moduleId: z.string().uuid('ModuleId harus berupa UUID yang valid'),
    order: z.number().int().min(0, 'Urutan harus angka non-negatif'),
    content: z
      .string()
      .min(1, 'Konten tidak boleh kosong')
      .max(2000, 'Konten kode maksimal 2000 karakter'),
    language: z.nativeEnum(ProgrammingLanguage, {
      errorMap: () => ({ message: 'Bahasa pemrograman tidak valid' }),
    }),
  }),
]);

// Schema untuk validasi input pembaruan halaman modul
export const ModulePageUpdateSchema = z.discriminatedUnion('type', [
  // Schema untuk tipe konten "teori"
  z.object({
    id: z.string().uuid('Id harus berupa UUID yang valid'),
    type: z.literal(ModulePageType.TEORI),
    order: z.number().int().min(0, 'Urutan harus angka non-negatif').optional(),
    content: z
      .string()
      .min(1, 'Konten tidak boleh kosong')
      .max(5000, 'Konten teori maksimal 5000 karakter')
      .optional(),
  }),
  // Schema untuk tipe konten "kode"
  z.object({
    id: z.string().uuid('Id harus berupa UUID yang valid'),
    type: z.literal(ModulePageType.KODE),
    order: z.number().int().min(0, 'Urutan harus angka non-negatif').optional(),
    content: z
      .string()
      .min(1, 'Konten tidak boleh kosong')
      .max(2000, 'Konten kode maksimal 2000 karakter')
      .optional(),
    language: z
      .nativeEnum(ProgrammingLanguage, {
        errorMap: () => ({ message: 'Bahasa pemrograman tidak valid' }),
      })
      .optional(),
  }),
]);

// Schema untuk validasi batch update urutan halaman
export const ModulePageReorderSchema = z.object({
  updates: z.array(
    z.object({
      pageId: z.string().uuid('PageId harus berupa UUID yang valid'),
      order: z.number().int().min(0, 'Urutan harus angka non-negatif'),
    })
  ).min(1, 'Minimal harus ada satu update'),
});

// Type inferensi dari schema
export type ModulePageCreateInput = z.infer<typeof ModulePageCreateSchema>;
export type ModulePageUpdateInput = z.infer<typeof ModulePageUpdateSchema>;
export type ModulePageReorderInput = z.infer<typeof ModulePageReorderSchema>;
