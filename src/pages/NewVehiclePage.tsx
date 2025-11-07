import { useEffect, useRef, useState } from 'react'
import { useSnackbar } from 'notistack'
import VehicleForm from '../components/VehicleForm'
import { useCreateVehicle } from '../hooks/useCreateVehicle'
import type { VehicleRequest, Vehicle } from '../types/vehicle'

export default function NewVehiclePage() {
  const { enqueueSnackbar } = useSnackbar()

  // State for created vehicle
  const [createdVehicle, setCreatedVehicle] = useState<Vehicle | null>(null)
  const [showCreatedVehicle, setShowCreatedVehicle] = useState(false)

  // State for confirmation dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingPayload, setPendingPayload] = useState<VehicleRequest | null>(
    null
  )

  // Ref for comparison section (for smooth scroll)
  const comparisonRef = useRef<HTMLDivElement>(null)

  // Hook for add mode
  const { create, loading: creating, error: createError } = useCreateVehicle()

  // Smooth scroll when created vehicle is shown
  useEffect(() => {
    if (showCreatedVehicle && comparisonRef.current) {
      setTimeout(() => {
        comparisonRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 100)
    }
  }, [showCreatedVehicle])

  const handleCreateConfirm = async () => {
    if (!pendingPayload) return

    setDialogOpen(false)

    const created = await create(pendingPayload)
    if (created) {
      enqueueSnackbar('Vehicle created successfully', { variant: 'success' })
      // Save created vehicle and show it
      setCreatedVehicle(created)
      setShowCreatedVehicle(true)
    } else if (createError) {
      enqueueSnackbar(
        createError.detail || createError.title || 'Error creating vehicle',
        { variant: 'error' }
      )
      if (createError.errors) {
        Object.entries(createError.errors).forEach(([field, message]) => {
          enqueueSnackbar(`${field}: ${message}`, { variant: 'error' })
        })
      }
    }
    setPendingPayload(null)
  }

  const handleSaveCancel = () => {
    setDialogOpen(false)
    setPendingPayload(null)
  }

  const onSubmit = (payload: VehicleRequest) => {
    // Show confirmation dialog for add mode
    setPendingPayload(payload)
    setDialogOpen(true)
  }

  return (
    <VehicleForm
      mode="add"
      loading={creating}
      onSubmit={onSubmit}
      dialogOpen={dialogOpen}
      pendingPayload={pendingPayload}
      onConfirm={handleCreateConfirm}
      onCancel={handleSaveCancel}
      createdVehicle={createdVehicle}
      showCreatedVehicle={showCreatedVehicle}
      comparisonRef={comparisonRef}
    />
  )
}
