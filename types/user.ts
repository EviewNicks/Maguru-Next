// type untuk user
export type User = {
  id: string
  clerkUserId?: string // Make optional
  name: string
  email: string
  role: 'admin' | 'mahasiswa' | 'dosen'
  status?: 'active' | 'inactive' // Make optional
  createdAt: string | Date // Allow string or Date
  updatedAt?: Date // Make optional
}
