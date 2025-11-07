import { api } from './axios'
import type { Page } from '../types/page'
import type { Vehicle, VehicleRequest } from '../types/vehicle'

const BASE = '/api/vehicles'

export interface ListVehiclesParams {
  page?: number
  size?: number
  sort?: string
}

export async function listVehicles({
  page = 0,
  size = 10,
  sort,
}: ListVehiclesParams = {}): Promise<Page<Vehicle>> {
  const params: Record<string, number | string> = { page, size }
  if (sort) params.sort = sort

  const res = await api.get<Page<Vehicle>>(`${BASE}/paged`, { params })
  return res.data
}

export async function createVehicle(payload: VehicleRequest): Promise<Vehicle> {
  const res = await api.post<Vehicle>(BASE, payload)
  return res.data
}

export async function getVehicle(id: number): Promise<Vehicle> {
  const res = await api.get<Vehicle>(`${BASE}/${id}`)
  return res.data
}

export async function updateVehicle(
  id: number,
  payload: VehicleRequest
): Promise<Vehicle> {
  const res = await api.put<Vehicle>(`${BASE}/${id}`, payload)
  return res.data
}

export async function deleteVehicle(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}

export async function seedVehicles(): Promise<Vehicle[]> {
  const res = await api.post<Vehicle[]>(`${BASE}/seed`)
  return res.data
}
