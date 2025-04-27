/**
 * Mengformat waktu menjadi string dengan format jam:menit:detik
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * Mengformat tanggal menjadi string dengan format "bulan hari, tahun"
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Mengembalikan warna gradient berdasarkan nama warna
 */
export const getColorGradient = (color: string): string => {
  switch (color) {
    case 'cyan':
      return 'cyan-500'
    case 'green':
      return 'from-green-500 to-emerald-500'
    case 'blue':
      return 'from-blue-500 to-indigo-500'
    case 'purple':
      return 'from-purple-500 to-pink-500'
    default:
      return 'from-cyan-500 to-blue-500'
  }
}

/**
 * Mengembalikan warna border berdasarkan nama warna
 */
export const getColorBorder = (color: string): string => {
  switch (color) {
    case 'cyan':
      return 'border-cyan-500/30'
    case 'green':
      return 'border-green-500/30'
    case 'blue':
      return 'border-blue-500/30'
    case 'purple':
      return 'border-purple-500/30'
    default:
      return 'border-cyan-500/30'
  }
}

/**
 * Mengembalikan warna teks berdasarkan nama warna
 */
export const getColorText = (color: string): string => {
  switch (color) {
    case 'cyan':
      return 'text-cyan-500'
    case 'green':
      return 'text-green-500'
    case 'blue':
      return 'text-blue-500'
    case 'purple':
      return 'text-purple-500'
    default:
      return 'text-cyan-500'
  }
}

export const getColorTextClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    cyan: 'text-cyan-500',
    green: 'text-green-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    // Default
    default: 'text-cyan-500',
  }

  return colorMap[color] || colorMap.default
}
