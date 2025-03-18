import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * Middleware untuk memeriksa apakah pengguna adalah admin
 * @param handler - Handler yang akan dijalankan jika pengguna adalah admin
 */
export function withAdminAuth(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const authObject = await auth();
    const userId = authObject.userId;
    const sessionClaims = authObject.sessionClaims;
    
    // Periksa apakah pengguna terautentikasi
    if (!userId) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }
    
    // Periksa apakah pengguna memiliki role admin
    // Catatan: Ini bergantung pada bagaimana role disimpan di Clerk
    // Mungkin perlu disesuaikan berdasarkan implementasi sebenarnya
    const userRole = sessionClaims?.role as string;
    
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengakses fitur ini.' },
        { status: 403 }
      );
    }
    
    // Tambahkan informasi pengguna ke request
    const requestWithUser = new NextRequest(req.url, {
      headers: req.headers,
      method: req.method,
      body: req.body,
      signal: req.signal,
    });
    
    // Simpan informasi pengguna di headers internal
    requestWithUser.headers.set('x-user-id', userId);
    requestWithUser.headers.set('x-user-role', userRole);
    
    // Jalankan handler jika pengguna adalah admin
    return handler(requestWithUser);
  };
}

/**
 * Middleware untuk mencatat aktivitas pengguna (audit trail)
 * @param handler - Handler yang akan dijalankan setelah aktivitas dicatat
 */
export function withAuditTrail(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const startTime = Date.now();
    const userId = req.headers.get('x-user-id') || 'anonymous';
    const method = req.method;
    const url = req.url;
    
    // Log aktivitas sebelum menjalankan handler
    console.log(`[AUDIT] ${new Date().toISOString()} | User: ${userId} | ${method} ${url}`);
    
    try {
      // Jalankan handler
      const response = await handler(req);
      
      // Log hasil dan waktu eksekusi
      const duration = Date.now() - startTime;
      console.log(`[AUDIT] ${new Date().toISOString()} | User: ${userId} | ${method} ${url} | Status: ${response.status} | Duration: ${duration}ms`);
      
      return response;
    } catch (error) {
      // Log error
      console.error(`[AUDIT] ${new Date().toISOString()} | User: ${userId} | ${method} ${url} | Error: ${error}`);
      
      // Re-throw error untuk ditangani oleh error handler
      throw error;
    }
  };
}

/**
 * Middleware untuk validasi request dengan Zod
 * @param schema - Skema Zod untuk validasi
 * @param handler - Handler yang akan dijalankan jika validasi berhasil
 */
export function withValidation<T>(schema: T, handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      // Clone request untuk mendapatkan body
      const clonedReq = req.clone();
      const body = await clonedReq.json();
      
      // Validasi body dengan skema Zod
      // @ts-expect-error - Kita tahu bahwa schema adalah Zod schema
      const validationResult = schema.safeParse(body);
      
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            error: 'Data tidak valid', 
            details: validationResult.error.format() 
          },
          { status: 400 }
        );
      }
      
      // Jalankan handler jika validasi berhasil
      return handler(req);
    } catch (error) {
      console.error('Validation error:', error);
      return NextResponse.json(
        { error: 'Terjadi kesalahan saat memvalidasi data' },
        { status: 500 }
      );
    }
  };
}

/**
 * Menggabungkan beberapa middleware menjadi satu
 * @param middlewares - Array middleware yang akan digabungkan
 */
export function composeMiddlewares(
  middlewares: Array<(handler: (req: NextRequest) => Promise<NextResponse>) => (req: NextRequest) => Promise<NextResponse>>, 
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
}
