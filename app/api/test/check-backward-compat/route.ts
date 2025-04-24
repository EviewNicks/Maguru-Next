import { NextResponse } from 'next/server'
import { getRoleFromLegacyFormat } from '@/lib/role-utils'

export async function GET() {
  // Simulasi data lama dari database (contoh: role disimpan sebagai number)
  const oldFormatRole = 1 // 1 = admin dalam format lama

  // Konversi ke format baru
  const { role, warning } = getRoleFromLegacyFormat(oldFormatRole)

  return NextResponse.json({
    role,
    _warning: warning,
  })
}
