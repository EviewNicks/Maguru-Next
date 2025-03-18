import { NextRequest, NextResponse } from 'next/server';
import { moduleService } from '../../../../features/manage-module/services/moduleService';
import { updateModuleSchema } from '../../../../features/manage-module/utils/moduleValidation';
import { withAdminAuth, withAuditTrail, withValidation, composeMiddlewares } from '../middleware';

// Tipe untuk params dari route dynamic
type RouteParams = { params: { id: string } };

/**
 * Handler untuk GET request
 * Mendapatkan modul berdasarkan ID
 */
async function getModuleHandler(request: NextRequest, context: RouteParams) {
  try {
    const moduleId = context.params.id;
    const moduleData = await moduleService.getModuleById(moduleId);
    
    if (!moduleData) {
      return NextResponse.json(
        { error: 'Modul tidak ditemukan' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(moduleData, { status: 200 });
  } catch (error) {
    console.error('Error fetching module:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data modul' }, 
      { status: 500 }
    );
  }
}

/**
 * Handler untuk PUT request
 * Mengupdate modul berdasarkan ID
 */
async function updateModuleHandler(request: NextRequest, context: RouteParams) {
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
    const updatedModule = await moduleService.updateModule(moduleId, body, userId);
    
    if (!updatedModule) {
      return NextResponse.json(
        { error: 'Modul tidak ditemukan' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedModule, { status: 200 });
  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate modul' }, 
      { status: 500 }
    );
  }
}

/**
 * Handler untuk DELETE request
 * Menghapus modul berdasarkan ID
 */
async function deleteModuleHandler(request: NextRequest, context: RouteParams) {
  try {
    const moduleId = context.params.id;
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID tidak ditemukan' }, 
        { status: 401 }
      );
    }
    
    const deletedModule = await moduleService.deleteModule(moduleId);
    
    if (!deletedModule) {
      return NextResponse.json(
        { error: 'Modul tidak ditemukan' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Modul berhasil dihapus' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus modul' }, 
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
    const id = pathParts[pathParts.length - 1];
    
    // Buat context dengan params
    const context: RouteParams = { params: { id } };
    
    // Panggil handler dengan context
    return handler(req, context);
  };
}

// Gunakan middleware untuk GET request
export const GET = composeMiddlewares(
  [withAdminAuth, withAuditTrail],
  createRouteHandler(getModuleHandler)
);

// Gunakan middleware untuk PUT request
export const PUT = composeMiddlewares(
  [withAdminAuth, withAuditTrail, (handler) => withValidation(updateModuleSchema, handler)],
  createRouteHandler(updateModuleHandler)
);

// Gunakan middleware untuk DELETE request
export const DELETE = composeMiddlewares(
  [withAdminAuth, withAuditTrail],
  createRouteHandler(deleteModuleHandler)
);
