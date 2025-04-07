/**
 * Tipe data untuk informasi pengguna
 */
export interface UserData {
  id: string
  name: string
  email: string
  role: string
  modules?: UserModule[]
}

/**
 * Tipe data untuk modul yang diakses pengguna
 */
export interface UserModule {
  id: string
  title: string
  progress: number
  completedAt?: string
  lastAccessedAt: string
}

/**
 * Tipe data untuk statistik pengguna
 */
export interface UserStats {
  completedModules: number
  totalModules: number
  averageScore: number
  lastQuizScore?: number
  totalXp: number
  level: number
}
