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

    // Check for connection refused error
    const isConnectionRefused =
      error?.code === 'ERR_NETWORK' ||
      error?.message?.includes('ERR_CONNECTION_REFUSED') ||
      error?.message?.includes('Network Error')

    // Determine error message
    let errorMessage: string
    if (isConnectionRefused) {
      errorMessage = 'Server is down, please start the server'
    } else if (data?.detail) {
      errorMessage = data.detail
    } else if (error?.message) {
      errorMessage = error.message
    } else {
      errorMessage = 'Unknown error'
    }

    // Show error via notistack
    enqueueSnackbar(errorMessage, {
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
      detail: isConnectionRefused
        ? 'Server is down, please start the server'
        : (error?.message ?? 'Unknown error'),
      instance: '',
      code: 'INTERNAL_ERROR',
      traceId: '',
    }

    return Promise.reject(fallback)
  }
)
