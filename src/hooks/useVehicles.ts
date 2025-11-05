import { useCallback, useEffect, useRef, useState } from 'react'
import { listVehicles } from '../api/vehicleApi'
import type { ApiError } from '../types/error'
import type { Vehicle } from '../types/vehicle'

interface UseVehiclesResult {
  vehicles: Vehicle[]
  loading: boolean
  error: ApiError | null
  reload: () => Promise<void>
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>
}

export function useVehicles(auto = true): UseVehiclesResult {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<ApiError | null>(null)
  const isMounted = useRef(true)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listVehicles()
      if (isMounted.current) setVehicles(data)
    } catch (err) {
      if (!isMounted.current) return
      setError(err as ApiError)
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    isMounted.current = true
    if (auto) void reload()
    return () => {
      isMounted.current = false
    }
  }, [auto, reload])

  return { vehicles, loading, error, reload, setVehicles }
}
