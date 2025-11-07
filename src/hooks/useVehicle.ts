import { useCallback, useEffect, useRef, useState } from 'react'
import { getVehicle } from '../api/vehicleApi'
import type { ApiError } from '../types/error'
import type { Vehicle } from '../types/vehicle'

interface UseVehicleResult {
  vehicle: Vehicle | null
  loading: boolean
  error: ApiError | null
  notFound: boolean
  reload: () => Promise<void>
}

export function useVehicle(id: number): UseVehicleResult {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [notFound, setNotFound] = useState<boolean>(false)
  const isMounted = useRef(true)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    setNotFound(false)
    try {
      const data = await getVehicle(id)
      if (isMounted.current) {
        setVehicle(data)
        setNotFound(false)
      }
    } catch (err) {
      if (!isMounted.current) return
      const apiError = err as ApiError
      setError(apiError)
      if (apiError.status === 404 || apiError.code === 'NOT_FOUND') {
        setNotFound(true)
      }
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }, [id])

  useEffect(() => {
    isMounted.current = true
    void reload()
    return () => {
      isMounted.current = false
    }
  }, [reload])

  return { vehicle, loading, error, notFound, reload }
}
