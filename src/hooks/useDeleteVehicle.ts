import { useCallback, useRef, useState } from 'react'
import { deleteVehicle } from '../api/vehicleApi'
import type { ApiError } from '../types/error'

interface UseDeleteVehicleResult {
  remove: (id: number) => Promise<boolean>
  loading: boolean
  error: ApiError | null
}

export function useDeleteVehicle(): UseDeleteVehicleResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const isMounted = useRef(true)

  const remove = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await deleteVehicle(id)
      if (!isMounted.current) return false
      return true
    } catch (err) {
      if (!isMounted.current) return false
      setError(err as ApiError)
      return false
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }, [])

  return { remove, loading, error }
}
