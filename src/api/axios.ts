import axios from 'axios'
import { enqueueSnackbar } from 'notistack'
import type { ApiError } from '../types/error'

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  response => response,
  error => {
    const data = error?.response?.data as ApiError | undefined

    // Show error via notistack
    enqueueSnackbar(data?.detail ?? error?.message ?? 'Unknown error', {
      variant: 'error',
    })

    // If backend returns Problem Details → pass as is
    if (data && typeof data === 'object' && 'status' in data) {
      return Promise.reject(data)
    }

    // Fallback for non-standard errors
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
