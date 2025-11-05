export type Fuel = 'diesel' | 'petrol' | 'hybrid'

export interface VehicleRequest {
  model: string // max 40
  firstRegistrationYear: string // exactly 4 digits
  cubicCapacity: number // 1..9999
  fuel: Fuel // lowercase JSON values
  mileage: number // 0..9_999_999
}

export interface Vehicle {
  id: number
  model: string
  firstRegistrationYear: string
  cubicCapacity: number
  fuel: Fuel
  mileage: number
}
