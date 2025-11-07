import { useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { useVehicle } from '../hooks/useVehicle'
import { useUpdateVehicle } from '../hooks/useUpdateVehicle'
import type { VehicleRequest, Fuel } from '../types/vehicle'

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

export default function EditVehiclePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { id } = useParams<{ id: string }>()
  const vehicleId = id ? parseInt(id, 10) : 0
  const { enqueueSnackbar } = useSnackbar()
  const fromPage = parseInt(searchParams.get('fromPage') || '1', 10)
  const {
    vehicle,
    loading: loadingVehicle,
    error: vehicleError,
    notFound,
  } = useVehicle(vehicleId)
  const { update, loading: updating, error: updateError } = useUpdateVehicle()

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

  // Populate form when vehicle data is loaded
  useEffect(() => {
    if (vehicle) {
      reset({
        model: vehicle.model,
        firstRegistrationYear: vehicle.firstRegistrationYear,
        cubicCapacity: vehicle.cubicCapacity,
        fuel: vehicle.fuel,
        mileage: vehicle.mileage,
      })
    }
  }, [vehicle, reset])

  // Handle not found error
  useEffect(() => {
    if (notFound || (vehicleError && vehicleError.status === 404)) {
      navigate(`/?page=${fromPage}`)
    }
  }, [notFound, vehicleError, enqueueSnackbar, navigate, fromPage])

  const onSubmit = async (data: VehicleFormData) => {
    const payload: VehicleRequest = {
      model: data.model,
      firstRegistrationYear: data.firstRegistrationYear,
      cubicCapacity: data.cubicCapacity,
      fuel: data.fuel,
      mileage: data.mileage,
    }

    const updated = await update(vehicleId, payload)
    if (updated) {
      enqueueSnackbar('Vehicle updated successfully', { variant: 'success' })
      navigate(`/?page=${fromPage}`)
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
  }

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

  if (vehicleError && !notFound) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 3 }}>
          {vehicleError.detail || vehicleError.title || 'Error loading vehicle'}
        </Alert>
      </Container>
    )
  }

  if (notFound) {
    return null
  }

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
          Edit vehicle
        </Typography>
        <Button
          variant="contained"
          color="success"
          type="submit"
          form="vehicle-form"
          loading={updating}
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
        onSubmit={handleSubmit(onSubmit)}
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
            disabled={updating}
          />

          <TextField
            {...register('firstRegistrationYear')}
            label="First registration year"
            fullWidth
            error={!!errors.firstRegistrationYear}
            helperText={errors.firstRegistrationYear?.message}
            disabled={updating}
            slotProps={{ htmlInput: { maxLength: 4 } }}
          />

          <TextField
            {...register('cubicCapacity', { valueAsNumber: true })}
            label="Cubic capacity"
            type="number"
            fullWidth
            error={!!errors.cubicCapacity}
            helperText={errors.cubicCapacity?.message}
            disabled={updating}
            slotProps={{ htmlInput: { min: 1, max: 9999 } }}
          />

          <FormControl fullWidth error={!!errors.fuel} disabled={updating}>
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
            label="Mileage"
            type="number"
            fullWidth
            error={!!errors.mileage}
            helperText={errors.mileage?.message}
            disabled={updating}
            slotProps={{ htmlInput: { min: 0, max: 9999999 } }}
          />
        </Box>
      </Box>
    </Container>
  )
}
