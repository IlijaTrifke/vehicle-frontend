import axios from 'axios'
import type { ApiError } from '../types/error'

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  response => response,
  error => {
    const data = error?.response?.data as ApiError | undefined

    // Ako backend vraća Problem Details → prosledi kako jeste
    if (data && typeof data === 'object' && 'status' in data) {
      return Promise.reject(data)
    }

    // Fallback za ne-standardne greške
    const fallback: ApiError = {
      type: 'about:blank',
      title: 'Error',
      status: error?.response?.status ?? 500,
      detail: error?.message ?? 'Unknown error',
      instance: '',
      code: 'INTERNAL_ERROR',
      traceId: '',
    }

    return Promise.reject(fallback)
  }
)
