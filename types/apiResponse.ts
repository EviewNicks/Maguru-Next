export type ApiResponse<T> = {
  data?: T
  message?: string
  error?: {
    code?: string
    message: string
    details?: Record<string, unknown>
  }
}
