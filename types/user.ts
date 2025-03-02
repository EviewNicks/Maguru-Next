// type untuk user
export type User = {
  id: string
  clerkUserId?: string // Make optional
  name: string
  email: string
  role: 'admin' | 'mahasiswa' | 'dosen'
  status: 'active' | 'inactive' | 'pending' // Pastikan nilai valid
  createdAt: string | Date // Allow string or Date
  updatedAt?: Date // Make optional
}

// types/user.ts (tambahan untuk action types)
export type UpdateUserPayload = {
  id: string
  role?: 'admin' | 'mahasiswa' | 'dosen'
  status?: 'active' | 'inactive' | 'pending'
  lastKnownUpdate?: Date // Add this for version control
}
