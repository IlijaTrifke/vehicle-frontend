import { useCallback, useRef, useState } from 'react'
import { createVehicle } from '../api/vehicleApi'
import type { ApiError } from '../types/error'
import type { Vehicle, VehicleRequest } from '../types/vehicle'

interface UseCreateVehicleResult {
  create: (payload: VehicleRequest) => Promise<Vehicle | null>
  loading: boolean
  error: ApiError | null
}

export function useCreateVehicle(): UseCreateVehicleResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const isMounted = useRef(true)

  const create = useCallback(async (payload: VehicleRequest) => {
    setLoading(true)
    setError(null)
    try {
      const created = await createVehicle(payload)
      if (!isMounted.current) return null
      return created
    } catch (err) {
      if (!isMounted.current) return null
      setError(err as ApiError)
      return null
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }, [])

  return { create, loading, error }
}
