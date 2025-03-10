// features/manage-module/middleware/validateRequest.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';

/**
 * Middleware untuk validasi request menggunakan Zod schema
 * @param schema - Zod schema untuk validasi
 * @param source - Sumber data untuk validasi (body, query, params)
 * @returns Middleware function untuk Next.js
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  source: 'body' | 'searchParams' = 'body'
) {
  return async (req: NextRequest) => {
    try {
      let data: Record<string, unknown> = {};
      
      if (source === 'body') {
        // Gunakan try-catch tanpa variabel error
        try {
          data = await req.json() as Record<string, unknown>;
        } catch {
          return { 
            success: false, 
            error: { 
              code: 'INVALID_JSON', 
              message: 'Format JSON tidak valid' 
            } 
          };
        }
      } else if (source === 'searchParams') {
        // Konversi URLSearchParams ke object
        const searchParams = req.nextUrl.searchParams;
        data = Object.fromEntries(searchParams.entries()) as Record<string, unknown>;
      }
      
      // Validasi data menggunakan schema
      const validatedData = schema.parse(data);
      
      // Return data yang sudah divalidasi
      return { success: true, data: validatedData };
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        // Jika error validasi, return detail error
        return { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Validasi input gagal', 
            details: validationError.errors 
          } 
        };
      }
      
      // Error lainnya
      console.error('Validation middleware error:', validationError);
      return { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Terjadi kesalahan internal'
        } 
      };
    }
  };
}
