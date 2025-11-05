import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { useCreateVehicle } from '../hooks/useCreateVehicle'
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

export default function NewVehiclePage() {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const { create, loading, error } = useCreateVehicle()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
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

  const onSubmit = async (data: VehicleFormData) => {
    const payload: VehicleRequest = {
      model: data.model,
      firstRegistrationYear: data.firstRegistrationYear,
      cubicCapacity: data.cubicCapacity,
      fuel: data.fuel,
      mileage: data.mileage,
    }

    const created = await create(payload)
    if (created) {
      enqueueSnackbar('Vehicle created successfully', { variant: 'success' })
      navigate('/')
    } else if (error) {
      enqueueSnackbar(error.detail || error.title || 'Error creating vehicle', {
        variant: 'error',
      })
      if (error.errors) {
        Object.entries(error.errors).forEach(([field, message]) => {
          enqueueSnackbar(`${field}: ${message}`, { variant: 'error' })
        })
      }
    }
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
          New vehicle
        </Typography>
        <Button
          variant="contained"
          color="success"
          type="submit"
          form="vehicle-form"
          loading={loading}
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
            label="Cubic capacity"
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
            label="Mileage"
            type="number"
            fullWidth
            error={!!errors.mileage}
            helperText={errors.mileage?.message}
            disabled={loading}
            slotProps={{ htmlInput: { min: 0, max: 9999999 } }}
          />
        </Box>
      </Box>
    </Container>
  )
}
