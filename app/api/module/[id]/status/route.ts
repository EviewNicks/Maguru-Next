import { NextRequest, NextResponse } from 'next/server';
import { moduleService } from '../../../../../features/manage-module/services/moduleService';
import { updateModuleStatusSchema } from '../../../../../features/manage-module/utils/moduleValidation';
import { withAdminAuth, withAuditTrail, withValidation, composeMiddlewares } from '../../middleware';

// Tipe untuk params dari route dynamic
type RouteParams = { params: { id: string } };

/**
 * Handler untuk PATCH request
 * Mengupdate status modul berdasarkan ID
 */
async function updateModuleStatusHandler(request: NextRequest, context: RouteParams) {
  try {
    const moduleId = context.params.id;
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID tidak ditemukan' }, 
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Perbarui status modul
    const updatedModule = await moduleService.updateModuleStatus(moduleId, body.status, userId);
    
    if (!updatedModule) {
      return NextResponse.json(
        { error: 'Modul tidak ditemukan' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedModule, { status: 200 });
  } catch (error) {
    console.error('Error updating module status:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate status modul' }, 
      { status: 500 }
    );
  }
}

// Wrapper untuk menangani params dari dynamic route
function createRouteHandler(handler: (req: NextRequest, context: RouteParams) => Promise<NextResponse>) {
  return (req: NextRequest) => {
    // Ekstrak ID dari URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    // Ambil ID modul (posisi ke-4 dari path /api/module/[id]/status)
    const id = pathParts[pathParts.length - 2];
    
    // Buat context dengan params
    const context: RouteParams = { params: { id } };
    
    // Panggil handler dengan context
    return handler(req, context);
  };
}

// Gunakan middleware untuk PATCH request
export const PATCH = composeMiddlewares(
  [withAdminAuth, withAuditTrail, (handler) => withValidation(updateModuleStatusSchema, handler)],
  createRouteHandler(updateModuleStatusHandler)
);
