import { useCallback, useRef, useState } from 'react'
import { updateVehicle } from '../api/vehicleApi'
import type { ApiError } from '../types/error'
import type { Vehicle, VehicleRequest } from '../types/vehicle'

interface UseUpdateVehicleResult {
  update: (id: number, payload: VehicleRequest) => Promise<Vehicle | null>
  loading: boolean
  error: ApiError | null
}

export function useUpdateVehicle(): UseUpdateVehicleResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const isMounted = useRef(true)

  const update = useCallback(async (id: number, payload: VehicleRequest) => {
    setLoading(true)
    setError(null)
    try {
      const updated = await updateVehicle(id, payload)
      if (!isMounted.current) return null
      return updated
    } catch (err) {
      if (!isMounted.current) return null
      setError(err as ApiError)
      return null
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }, [])

  return { update, loading, error }
}
