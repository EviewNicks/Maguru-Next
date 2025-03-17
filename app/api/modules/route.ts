// app/api/modules/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createModule, getModules } from '@/features/manage-module/services/moduleService';
import { ModuleCreateSchema, GetModulesSchema } from '@/features/manage-module/schemas/moduleSchema';
import { validateRequest } from '@/features/manage-module/middleware/validateRequest';
import { isAdmin } from '@/features/manage-module/middleware/authMiddleware';
import { ZodError } from 'zod';
import { GetModulesOptions, ModuleCreateInput, ModuleStatus } from '@/features/manage-module/types';

/**
 * POST /api/modules - Membuat modul baru
 * Hanya admin yang diizinkan
 */
export async function POST(req: NextRequest) {
  try {
    // Validasi request
    const validationResult = await validateRequest(ModuleCreateSchema)(req);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }
    
    // Periksa otorisasi
    const authResult = await isAdmin()(req);
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error || { code: 'UNKNOWN_ERROR', message: 'An unknown error occurred' } },
        { status: authResult.error?.code === 'UNAUTHORIZED' ? 401 : 403 }
      );
    }
    
    // Set createdBy dari user yang terotentikasi
    const moduleData: ModuleCreateInput = {
      title: validationResult.data?.title || "",
      description: validationResult.data?.description || undefined,
      status: (validationResult.data?.status as ModuleStatus) || ModuleStatus.DRAFT,
      createdBy: authResult.user.id,
    };
    
    // Buat modul
    const newModule = await createModule(moduleData);
    
    // Return response
    return NextResponse.json(newModule, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/modules:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Validasi input gagal', 
            details: error.errors 
          } 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Terjadi kesalahan internal' 
        } 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/modules - Mengambil daftar modul
 * Dengan dukungan untuk filter, search, dan pagination
 */
export async function GET(req: NextRequest) {
  try {
    // Validasi query parameters
    const validationResult = await validateRequest(GetModulesSchema, 'searchParams')(req);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }
    
    // Ambil daftar modul dengan opsi yang tervalidasi
    const options: GetModulesOptions = {
      status: validationResult.data?.status,
      limit: validationResult.data?.limit || 10,
      cursor: validationResult.data?.cursor,
      search: validationResult.data?.search
    };
    
    const modules = await getModules(options);
    
    // Return response
    return NextResponse.json({ 
      modules,
      pagination: {
        count: modules.length,
        hasMore: modules.length === (options.limit || 10),
        nextCursor: modules.length > 0 ? modules[modules.length - 1].id : undefined
      }
    });
  } catch (error) {
    console.error('Error in GET /api/modules:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Validasi input gagal', 
            details: error.errors 
          } 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Terjadi kesalahan internal' 
        } 
      },
      { status: 500 }
    );
  }
}
