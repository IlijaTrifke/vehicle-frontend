import { useCallback, useEffect, useRef, useState } from 'react'
import { listVehicles, type ListVehiclesParams } from '../api/vehicleApi'
import type { ApiError } from '../types/error'
import type { Page } from '../types/page'
import type { Vehicle } from '../types/vehicle'

interface UseVehiclesResult {
  vehicles: Vehicle[]
  loading: boolean
  error: ApiError | null
  reload: (params?: ListVehiclesParams) => Promise<void>
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>
  page: Page<Vehicle> | null
}

export function useVehicles(auto = true): UseVehiclesResult {
  const [vehicles, setVehiclesState] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [page, setPage] = useState<Page<Vehicle> | null>(null)
  const isMounted = useRef(true)
  const paramsRef = useRef<ListVehiclesParams>({})

  const setVehicles = useCallback((value: React.SetStateAction<Vehicle[]>) => {
    setVehiclesState(prev => {
      const next =
        typeof value === 'function'
          ? (value as (prev: Vehicle[]) => Vehicle[])(prev)
          : value
      setPage(prevPage =>
        prevPage ? { ...prevPage, content: next } : prevPage
      )
      return next
    })
  }, [])

  const reload = useCallback(async (paramsOverride?: ListVehiclesParams) => {
    setLoading(true)
    setError(null)
    const nextParams = { ...paramsRef.current, ...paramsOverride }
    paramsRef.current = nextParams
    try {
      const data = await listVehicles(nextParams)
      if (isMounted.current) {
        setPage(data)
        setVehiclesState(data.content)
      }
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

  return { vehicles, loading, error, reload, setVehicles, page }
}
