import { api } from './axios'
import type { Vehicle, VehicleRequest } from '../types/vehicle'

const BASE = '/api/vehicles'

export async function listVehicles(): Promise<Vehicle[]> {
  const res = await api.get<Vehicle[]>(BASE)
  return res.data
}

export async function createVehicle(payload: VehicleRequest): Promise<Vehicle> {
  const res = await api.post<Vehicle>(BASE, payload)
  return res.data
}

export async function deleteVehicle(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}
