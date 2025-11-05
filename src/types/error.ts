export type ErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'TYPE_MISMATCH'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR'

export interface ApiError {
  type: string // URI
  title: string
  status: number
  detail: string
  instance: string // URI
  code: ErrorCode
  traceId: string
  errors?: Record<string, string> // Field-specific validation errors
  resource?: string // For 404 errors
  resourceId?: string // For 404 errors
}
