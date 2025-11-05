import { useNavigate } from 'react-router-dom'
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
  Alert,
} from '@mui/material'
import { useCreateVehicle } from '../hooks/useCreateVehicle'
import type { VehicleRequest, Fuel } from '../types/vehicle'

const vehicleSchema = z.object({
  model: z
    .string()
    .min(1, 'Model is required')
    .max(40, 'Model must be at most 40 characters'),
  firstRegistrationYear: z
    .string()
    .regex(/^\d{4}$/, 'First registration year must have exactly 4 digits'),
  cubicCapacity: z
    .number()
    .int('Cubic capacity must be an integer')
    .positive('Cubic capacity must be positive')
    .max(9999, 'Cubic capacity must be at most 9999'),
  fuel: z.enum(['diesel', 'petrol', 'hybrid']),
  mileage: z
    .number()
    .int('Mileage must be an integer')
    .min(0, 'Mileage must be greater than or equal to 0')
    .max(9999999, 'Mileage must be at most 9,999,999'),
})

type VehicleFormData = z.infer<typeof vehicleSchema>

export default function NewVehiclePage() {
  const navigate = useNavigate()
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
      navigate('/')
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
          disabled={loading}
          sx={{
            backgroundColor: '#4caf50',
            '&:hover': {
              backgroundColor: '#45a049',
            },
          }}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ marginBottom: 3 }}>
          {error.detail || error.title || 'Error creating vehicle'}
          {error.errors && (
            <Box
              component="ul"
              sx={{ marginTop: 1, marginBottom: 0, paddingLeft: 2 }}
            >
              {Object.entries(error.errors).map(([field, message]) => (
                <li key={field}>
                  {field}: {message}
                </li>
              ))}
            </Box>
          )}
        </Alert>
      )}

      <Box
        component="form"
        id="vehicle-form"
        onSubmit={handleSubmit(onSubmit)}
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
            inputProps={{ maxLength: 4 }}
          />

          <TextField
            {...register('cubicCapacity', { valueAsNumber: true })}
            label="Cubic capacity"
            type="number"
            fullWidth
            error={!!errors.cubicCapacity}
            helperText={errors.cubicCapacity?.message}
            disabled={loading}
            inputProps={{ min: 1, max: 9999 }}
          />

          <FormControl fullWidth error={!!errors.fuel} disabled={loading}>
            <InputLabel>Fuel</InputLabel>
            <Select
              {...register('fuel')}
              value={fuelValue || ''}
              label="Fuel"
              onChange={e => setValue('fuel', e.target.value as Fuel)}
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
            inputProps={{ min: 0, max: 9999999 }}
          />
        </Box>
      </Box>
    </Container>
  )
}
