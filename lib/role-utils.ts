/**
 * Utilitas untuk menangani konversi format role lama ke format baru
 */

type RoleConversionResult = {
  role: string
  warning?: string
}

/**
 * Konversi dari format role lama (number) ke format baru (string)
 * @param legacyRole - Role dalam format lama (number)
 * @returns Objek yang berisi role dalam format baru dan warning jika menggunakan format lama
 */
export function getRoleFromLegacyFormat(
  legacyRole: number
): RoleConversionResult {
  const warning =
    'Deprecated: menggunakan format role lama (number). Harap gunakan format role baru (string).'

  // Mapping dari format lama ke format baru
  switch (legacyRole) {
    case 1:
      return { role: 'admin', warning }
    case 2:
    case 3:
      return { role: 'mahasiswa', warning }
    default:
      return {
        role: 'mahasiswa',
        warning: `${warning} Format role tidak dikenal.`,
      }
  }
}

/**
 * Mendapatkan role dalam format baru, baik dari input string maupun number
 * @param role - Role dalam format string atau number
 * @returns Objek yang berisi role dalam format baru dan warning jika menggunakan format lama
 */
export function getNormalizedRole(role: string | number): RoleConversionResult {
  if (typeof role === 'number') {
    return getRoleFromLegacyFormat(role)
  }

  // Jika role valid, gunakan apa adanya
  if (['admin', 'mahasiswa'].includes(role)) {
    return { role }
  }

  // Default ke mahasiswa jika format tidak dikenal
  return {
    role: 'mahasiswa',
    warning: `Format role tidak valid: ${role}. Menggunakan default: mahasiswa.`,
  }
}
