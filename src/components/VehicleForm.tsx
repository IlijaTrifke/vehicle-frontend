import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { formatFuel } from '../helpers/vehicleHelpers'
import VehicleDetailsDisplay from './VehicleDetailsDisplay'
import type { VehicleRequest, Fuel, Vehicle } from '../types/vehicle'

const vehicleSchema = z.object({
  model: z
    .string({ message: 'Model must be a text value' })
    .min(1, 'Model is required')
    .max(40, 'Model must be at most 40 characters'),
  firstRegistrationYear: z
    .string({ message: 'First registration year must be a text value' })
    .min(1, 'First registration year is required')
    .regex(/^\d{4}$/, 'First registration year must have exactly 4 digits'),
  cubicCapacity: z
    .number({ message: 'Cubic capacity must be a number' })
    .positive('Cubic capacity must be a positive number')
    .max(9999, 'Cubic capacity must be at most 9999'),
  fuel: z.enum(['diesel', 'petrol', 'hybrid'], {
    message: 'Please select a valid fuel type (diesel, petrol, or hybrid)',
  }),
  mileage: z
    .number({ message: 'Mileage must be a number' })
    .min(0, 'Mileage must be greater than or equal to 0')
    .max(9999999, 'Mileage must be at most 9,999,999'),
})

type VehicleFormData = z.infer<typeof vehicleSchema>

interface VehicleFormProps {
  mode: 'add' | 'edit'
  loading: boolean
  initialValues?: {
    model: string
    firstRegistrationYear: string
    cubicCapacity: number
    fuel: Fuel
    mileage: number
  }
  onSubmit: (payload: VehicleRequest) => void
  dialogOpen: boolean
  pendingPayload: VehicleRequest | null
  onConfirm: () => void
  onCancel: () => void
  noChangesDialogOpen?: boolean
  onNoChangesClose?: () => void
  createdVehicle?: Vehicle | null
  showCreatedVehicle?: boolean
  originalBeforeUpdate?: Vehicle | null
  updatedVehicle?: Vehicle | null
  showComparison?: boolean
  comparisonRef?: React.RefObject<HTMLDivElement | null>
}

export default function VehicleForm({
  mode,
  loading,
  initialValues,
  onSubmit,
  dialogOpen,
  pendingPayload,
  onConfirm,
  onCancel,
  noChangesDialogOpen = false,
  onNoChangesClose,
  createdVehicle,
  showCreatedVehicle = false,
  originalBeforeUpdate,
  updatedVehicle,
  showComparison = false,
  comparisonRef,
}: VehicleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      model: '',
      firstRegistrationYear: '',
      cubicCapacity: undefined,
      fuel: undefined,
      mileage: undefined,
    },
  })

  const fuelValue = watch('fuel')

  // Populate form when initialValues change (edit mode)
  useEffect(() => {
    if (initialValues) {
      reset({
        model: initialValues.model,
        firstRegistrationYear: initialValues.firstRegistrationYear,
        cubicCapacity: initialValues.cubicCapacity,
        fuel: initialValues.fuel,
        mileage: initialValues.mileage,
      })
    }
  }, [initialValues, reset])

  const onFormSubmit = (data: VehicleFormData) => {
    const payload: VehicleRequest = {
      model: data.model,
      firstRegistrationYear: data.firstRegistrationYear,
      cubicCapacity: data.cubicCapacity,
      fuel: data.fuel,
      mileage: data.mileage,
    }
    onSubmit(payload)
  }

  const title = mode === 'add' ? 'New vehicle' : 'Edit vehicle'

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Button
          variant="contained"
          color="success"
          type="submit"
          form="vehicle-form"
          disabled={loading}
          sx={{
            backgroundColor: '#4caf50',
            '&:hover': {
              backgroundColor: '#45a049',
            },
          }}
        >
          Save
        </Button>
      </Box>

      <Box
        component="form"
        id="vehicle-form"
        onSubmit={handleSubmit(onFormSubmit)}
        noValidate
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          <TextField
            {...register('model')}
            label="Model"
            fullWidth
            error={!!errors.model}
            helperText={errors.model?.message}
            disabled={loading}
          />

          <TextField
            {...register('firstRegistrationYear')}
            label="First registration year"
            fullWidth
            error={!!errors.firstRegistrationYear}
            helperText={errors.firstRegistrationYear?.message}
            disabled={loading}
            slotProps={{ htmlInput: { maxLength: 4 } }}
          />

          <TextField
            {...register('cubicCapacity', { valueAsNumber: true })}
            label="Cubic capacity (cm³)"
            type="number"
            fullWidth
            error={!!errors.cubicCapacity}
            helperText={errors.cubicCapacity?.message}
            disabled={loading}
            slotProps={{ htmlInput: { min: 1, max: 9999 } }}
          />

          <FormControl fullWidth error={!!errors.fuel} disabled={loading}>
            <InputLabel>Fuel</InputLabel>
            <Select
              value={fuelValue || ''}
              label="Fuel"
              onChange={e =>
                setValue('fuel', e.target.value as Fuel, {
                  shouldValidate: true,
                })
              }
            >
              <MenuItem value="diesel">Diesel</MenuItem>
              <MenuItem value="petrol">Petrol</MenuItem>
              <MenuItem value="hybrid">Hybrid</MenuItem>
            </Select>
            {errors.fuel && (
              <FormHelperText>{errors.fuel.message}</FormHelperText>
            )}
          </FormControl>

          <TextField
            {...register('mileage', { valueAsNumber: true })}
            label="Mileage (km)"
            type="number"
            fullWidth
            error={!!errors.mileage}
            helperText={errors.mileage?.message}
            disabled={loading}
            slotProps={{ htmlInput: { min: 0, max: 9999999 } }}
          />
        </Box>
      </Box>

      {/* Vehicle details display section */}
      {((mode === 'add' && showCreatedVehicle && createdVehicle) ||
        (mode === 'edit' &&
          showComparison &&
          originalBeforeUpdate &&
          updatedVehicle)) && (
        <Box ref={comparisonRef}>
          <VehicleDetailsDisplay
            title={mode === 'add' ? 'Added vehicle:' : 'Changes made:'}
            vehicle={
              mode === 'add' && createdVehicle
                ? createdVehicle
                : (updatedVehicle as Vehicle)
            }
            originalVehicle={mode === 'edit' ? originalBeforeUpdate : null}
            mode={mode}
          />
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={onCancel}
        aria-labelledby="save-dialog-title"
        aria-describedby="save-dialog-description"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle id="save-dialog-title">
          {mode === 'add' ? 'Create Vehicle' : 'Save Changes'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="save-dialog-description" sx={{ mb: 2 }}>
            {mode === 'add'
              ? 'Are you sure you want to create this vehicle?'
              : 'Are you sure you want to save these changes?'}
          </DialogContentText>
          {mode === 'add' && pendingPayload && (
            <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', mb: 2, color: '#008080' }}
              >
                Vehicle to be created:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 'bold', mb: 0.5 }}
                  >
                    Model:
                  </Typography>
                  <Typography variant="body2">
                    {pendingPayload.model}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 'bold', mb: 0.5 }}
                  >
                    First registration year:
                  </Typography>
                  <Typography variant="body2">
                    {pendingPayload.firstRegistrationYear}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 'bold', mb: 0.5 }}
                  >
                    Cubic capacity:
                  </Typography>
                  <Typography variant="body2">
                    {pendingPayload.cubicCapacity} cm³
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 'bold', mb: 0.5 }}
                  >
                    Fuel:
                  </Typography>
                  <Typography variant="body2">
                    {formatFuel(pendingPayload.fuel)}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 'bold', mb: 0.5 }}
                  >
                    Mileage:
                  </Typography>
                  <Typography variant="body2">
                    {pendingPayload.mileage.toLocaleString()} km
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
          {mode === 'edit' && originalBeforeUpdate && pendingPayload && (
            <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', mb: 2, color: '#008080' }}
              >
                Changes to be saved:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {originalBeforeUpdate.model !== pendingPayload.model && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 'bold', mb: 0.5 }}
                    >
                      Model:
                    </Typography>
                    <Typography variant="body2">
                      {originalBeforeUpdate.model} → {pendingPayload.model}
                    </Typography>
                  </Box>
                )}

                {originalBeforeUpdate.firstRegistrationYear !==
                  pendingPayload.firstRegistrationYear && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 'bold', mb: 0.5 }}
                    >
                      First registration year:
                    </Typography>
                    <Typography variant="body2">
                      {originalBeforeUpdate.firstRegistrationYear} →{' '}
                      {pendingPayload.firstRegistrationYear}
                    </Typography>
                  </Box>
                )}

                {originalBeforeUpdate.cubicCapacity !==
                  pendingPayload.cubicCapacity && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 'bold', mb: 0.5 }}
                    >
                      Cubic capacity:
                    </Typography>
                    <Typography variant="body2">
                      {originalBeforeUpdate.cubicCapacity} cm³ →{' '}
                      {pendingPayload.cubicCapacity} cm³
                    </Typography>
                  </Box>
                )}

                {originalBeforeUpdate.fuel !== pendingPayload.fuel && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 'bold', mb: 0.5 }}
                    >
                      Fuel:
                    </Typography>
                    <Typography variant="body2">
                      {formatFuel(originalBeforeUpdate.fuel)} →{' '}
                      {formatFuel(pendingPayload.fuel)}
                    </Typography>
                  </Box>
                )}

                {originalBeforeUpdate.mileage !== pendingPayload.mileage && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 'bold', mb: 0.5 }}
                    >
                      Mileage:
                    </Typography>
                    <Typography variant="body2">
                      {originalBeforeUpdate.mileage.toLocaleString()} km →{' '}
                      {pendingPayload.mileage.toLocaleString()} km
                    </Typography>
                  </Box>
                )}

                {originalBeforeUpdate.model === pendingPayload.model &&
                  originalBeforeUpdate.firstRegistrationYear ===
                    pendingPayload.firstRegistrationYear &&
                  originalBeforeUpdate.cubicCapacity ===
                    pendingPayload.cubicCapacity &&
                  originalBeforeUpdate.fuel === pendingPayload.fuel &&
                  originalBeforeUpdate.mileage === pendingPayload.mileage && (
                    <Typography variant="body2" color="text.secondary">
                      No changes detected.
                    </Typography>
                  )}
              </Box>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            color="success"
            variant="contained"
            autoFocus
            loading={loading}
          >
            {mode === 'add' ? 'Create' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* No Changes Info Dialog */}
      {noChangesDialogOpen !== undefined && onNoChangesClose && (
        <Dialog
          open={noChangesDialogOpen}
          onClose={onNoChangesClose}
          aria-labelledby="no-changes-dialog-title"
          aria-describedby="no-changes-dialog-description"
        >
          <DialogTitle id="no-changes-dialog-title">No Changes</DialogTitle>
          <DialogContent>
            <DialogContentText id="no-changes-dialog-description">
              There are no changes to save. All values remain the same.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={onNoChangesClose}
              color="primary"
              variant="contained"
              autoFocus
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  )
}
