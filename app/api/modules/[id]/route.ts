// app/api/modules/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getModuleById, updateModule, deleteModule } from '@/features/manage-module/services/moduleService';
import { ModuleUpdateSchema } from '@/features/manage-module/schemas/moduleSchema';
import { validateRequest } from '@/features/manage-module/middleware/validateRequest';
import { isAdmin } from '@/features/manage-module/middleware/authMiddleware';
import { ZodError } from 'zod';
import { ModuleStatus, ModuleUpdateInput } from '@/features/manage-module/types';

/**
 * GET /api/modules/[id] - Mengambil modul berdasarkan ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { 
          error: { 
            code: 'INVALID_ID', 
            message: 'ID modul tidak valid' 
          } 
        },
        { status: 400 }
      );
    }
    
    // const retrievedModule = await getModuleById(id);
    
    if (!module) {
      return NextResponse.json(
        { 
          error: { 
            code: 'MODULE_NOT_FOUND', 
            message: 'Modul tidak ditemukan' 
          } 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(module);
  } catch (error) {
    console.error(`Error in GET /api/modules/${params.id}:`, error);
    
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
 * PUT /api/modules/[id] - Memperbarui modul berdasarkan ID
 * Hanya admin yang diizinkan
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { 
          error: { 
            code: 'INVALID_ID', 
            message: 'ID modul tidak valid' 
          } 
        },
        { status: 400 }
      );
    }
    
    // Validasi request
    const validationResult = await validateRequest(ModuleUpdateSchema)(req);
    
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
    
    // Periksa apakah modul ada
    const existingModule = await getModuleById(id);
    
    if (!existingModule) {
      return NextResponse.json(
        { 
          error: { 
            code: 'MODULE_NOT_FOUND', 
            message: 'Modul tidak ditemukan' 
          } 
        },
        { status: 404 }
      );
    }
    
    // Set updatedBy dari user yang terotentikasi
    const updateData: ModuleUpdateInput = {
      title: validationResult.data?.title,
      description: validationResult.data?.description,
      status: validationResult.data?.status as ModuleStatus | undefined,
      updatedBy: authResult.user.id,
    };
    
    // Update modul
    const updatedModule = await updateModule(id, updateData);
    
    // Return response
    return NextResponse.json(updatedModule);
  } catch (error) {
    console.error(`Error in PUT /api/modules/${params.id}:`, error);
    
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
 * DELETE /api/modules/[id] - Menghapus modul berdasarkan ID
 * Hanya admin yang diizinkan
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { 
          error: { 
            code: 'INVALID_ID', 
            message: 'ID modul tidak valid' 
          } 
        },
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
    
    // Periksa apakah modul ada
    const existingModule = await getModuleById(id);
    
    if (!existingModule) {
      return NextResponse.json(
        { 
          error: { 
            code: 'MODULE_NOT_FOUND', 
            message: 'Modul tidak ditemukan' 
          } 
        },
        { status: 404 }
      );
    }
    
    // Hapus modul
    await deleteModule(id);
    
    // Return response
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error in DELETE /api/modules/${params.id}:`, error);
    
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
