/**
 * Memformat persentase dengan jumlah digit desimal tertentu
 * @param value - Nilai persentase (0-100)
 * @param digits - Jumlah digit desimal (default: 0)
 * @returns String persentase dengan format
 */
export function formatPercentage(value: number, digits: number = 0): string {
  return `${value.toFixed(digits)}%`
}

/**
 * Memformat tanggal ke format lokal
 * @param dateString - String tanggal dalam format ISO
 * @returns String tanggal dalam format lokal
 */
export function formatDate(dateString: string): string {
  if (!dateString) return ''

  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Memformat timestamp menjadi string "time ago"
 * @param dateString - String tanggal dalam format ISO
 * @returns String "time ago" (mis: "2 hari yang lalu")
 */
export function timeAgo(dateString: string): string {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} detik yang lalu`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} menit yang lalu`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} jam yang lalu`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} hari yang lalu`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} bulan yang lalu`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} tahun yang lalu`
}
