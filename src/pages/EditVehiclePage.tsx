import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { Alert, Box, CircularProgress, Container } from '@mui/material'
import VehicleForm from '../components/VehicleForm'
import { useVehicle } from '../hooks/useVehicle'
import { useUpdateVehicle } from '../hooks/useUpdateVehicle'
import type { VehicleRequest, Vehicle } from '../types/vehicle'

export default function EditVehiclePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const vehicleId = id ? parseInt(id, 10) : undefined
  const fromPage = searchParams.get('fromPage') || '1'
  const { enqueueSnackbar } = useSnackbar()

  // State for comparison
  const [originalVehicle, setOriginalVehicle] = useState<Vehicle | null>(null)
  const [originalBeforeUpdate, setOriginalBeforeUpdate] =
    useState<Vehicle | null>(null)
  const [updatedVehicle, setUpdatedVehicle] = useState<Vehicle | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  // State for confirmation dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingPayload, setPendingPayload] = useState<VehicleRequest | null>(
    null
  )
  // State for no changes info dialog
  const [noChangesDialogOpen, setNoChangesDialogOpen] = useState(false)

  // Ref for comparison section (for smooth scroll)
  const comparisonRef = useRef<HTMLDivElement>(null)

  // Hooks for edit mode
  const {
    vehicle,
    loading: loadingVehicle,
    error: vehicleError,
    notFound,
  } = useVehicle(vehicleId || 0)
  const { update, loading: updating, error: updateError } = useUpdateVehicle()

  // Populate form when vehicle data is loaded
  useEffect(() => {
    if (vehicle) {
      // Save original vehicle for comparison
      setOriginalVehicle(vehicle)
      setOriginalBeforeUpdate(null)
      setShowComparison(false)
      setUpdatedVehicle(null)
    }
  }, [vehicle])

  // Handle not found error
  useEffect(() => {
    if (notFound || (vehicleError && vehicleError.status === 404)) {
      navigate(`/?page=${fromPage}`)
    }
  }, [notFound, vehicleError, navigate, fromPage])

  // Smooth scroll when comparison is shown
  useEffect(() => {
    if (showComparison && comparisonRef.current) {
      setTimeout(() => {
        comparisonRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 100)
    }
  }, [showComparison])

  const handleSaveConfirm = async () => {
    if (!vehicleId || !originalVehicle || !pendingPayload) return

    setDialogOpen(false)

    const updated = await update(vehicleId, pendingPayload)
    if (updated) {
      enqueueSnackbar('Vehicle updated successfully', { variant: 'success' })
      // Save updated vehicle and show comparison
      setUpdatedVehicle(updated)
      setShowComparison(true)
      // Update original vehicle to current state for next comparison
      setOriginalVehicle(updated)
    } else if (updateError) {
      enqueueSnackbar(
        updateError.detail || updateError.title || 'Error updating vehicle',
        { variant: 'error' }
      )
      if (updateError.errors) {
        Object.entries(updateError.errors).forEach(([field, message]) => {
          enqueueSnackbar(`${field}: ${message}`, { variant: 'error' })
        })
      }
    }
    setPendingPayload(null)
  }

  const handleSaveCancel = () => {
    setDialogOpen(false)
    setPendingPayload(null)
    setOriginalBeforeUpdate(null)
  }

  const onSubmit = (payload: VehicleRequest) => {
    if (!vehicleId || !originalVehicle) return

    // Check if there are any changes
    const hasChanges =
      originalVehicle.model !== payload.model ||
      originalVehicle.firstRegistrationYear !== payload.firstRegistrationYear ||
      originalVehicle.cubicCapacity !== payload.cubicCapacity ||
      originalVehicle.fuel !== payload.fuel ||
      originalVehicle.mileage !== payload.mileage

    if (!hasChanges) {
      // No changes -> show info dialog
      setNoChangesDialogOpen(true)
    } else {
      // Has changes -> show confirmation dialog
      setOriginalBeforeUpdate({ ...originalVehicle })
      setPendingPayload(payload)
      setDialogOpen(true)
    }
  }

  // Initial values for form
  const currentVehicle = updatedVehicle || vehicle
  const initialValues = useMemo(
    () =>
      currentVehicle
        ? {
            model: currentVehicle.model,
            firstRegistrationYear: currentVehicle.firstRegistrationYear,
            cubicCapacity: currentVehicle.cubicCapacity,
            fuel: currentVehicle.fuel,
            mileage: currentVehicle.mileage,
          }
        : undefined,
    [currentVehicle]
  )

  // Loading vehicle data
  if (loadingVehicle) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  // Error loading vehicle
  if (vehicleError && !notFound) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 3 }}>
          {vehicleError.detail || vehicleError.title || 'Error loading vehicle'}
        </Alert>
      </Container>
    )
  }

  // Not found state
  if (notFound || !vehicleId) {
    return null
  }

  return (
    <VehicleForm
      mode="edit"
      loading={updating}
      initialValues={initialValues}
      onSubmit={onSubmit}
      dialogOpen={dialogOpen}
      pendingPayload={pendingPayload}
      onConfirm={handleSaveConfirm}
      onCancel={handleSaveCancel}
      noChangesDialogOpen={noChangesDialogOpen}
      onNoChangesClose={() => setNoChangesDialogOpen(false)}
      originalBeforeUpdate={originalBeforeUpdate}
      updatedVehicle={updatedVehicle}
      showComparison={showComparison}
      comparisonRef={comparisonRef}
    />
  )
}
