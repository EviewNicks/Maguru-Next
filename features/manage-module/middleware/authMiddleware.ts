// features/manage-module/middleware/authMiddleware.ts
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * Middleware untuk memeriksa apakah pengguna adalah admin
 * @returns Middleware function untuk Next.js
 */
export function isAdmin() {
  return async (req: NextRequest) => {
    try {
      const { userId } = await auth();
      
      if (!userId) {
        return { 
          success: false, 
          error: { 
            code: 'UNAUTHORIZED', 
            message: 'Tidak terautentikasi' 
          } 
        };
      }
      
      // Ambil data user dari database (contoh)
      // Di implementasi nyata, ini akan memeriksa role user dari database
      try {
        const response = await fetch(`${req.nextUrl.origin}/api/users/${userId}`);
        
        if (!response.ok) {
          return { 
            success: false, 
            error: { 
              code: 'USER_NOT_FOUND', 
              message: 'User tidak ditemukan' 
            } 
          };
        }
        
        // Tambahkan penanganan error untuk parsing JSON
        let userData;
        try {
          userData = await response.json();
        } catch (jsonError) {
          console.error('Error parsing user data:', jsonError);
          
          // Untuk pengembangan, kita izinkan akses sementara jika terjadi error parsing
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Development mode: Bypassing admin check due to JSON parsing error');
            return { 
              success: true, 
              user: { role: 'ADMIN', id: userId, name: 'Dev Admin' }
            };
          }
          
          return { 
            success: false, 
            error: { 
              code: 'INVALID_RESPONSE', 
              message: 'Format respons tidak valid' 
            } 
          };
        }
        
        // Periksa jika user adalah admin
        if (userData.role !== 'ADMIN') {
          return { 
            success: false, 
            error: { 
              code: 'FORBIDDEN', 
              message: 'Hanya admin yang diperbolehkan melakukan aksi ini' 
            } 
          };
        }
        
        return { success: true, user: userData };
      } catch (fetchError) {
        console.error('Error fetching user data:', fetchError);
        
        // Untuk pengembangan, kita izinkan akses sementara
        // PENTING: Hapus ini di production!
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Development mode: Bypassing admin check');
          return { 
            success: true, 
            user: { role: 'ADMIN', id: userId, name: 'Dev Admin' }
          };
        }
        
        return { 
          success: false, 
          error: { 
            code: 'SERVER_ERROR', 
            message: 'Gagal memverifikasi status admin' 
          } 
        };
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      
      return { 
        success: false, 
        error: { 
          code: 'SERVER_ERROR', 
          message: 'Terjadi kesalahan saat memproses permintaan' 
        } 
      };
    }
  };
}
