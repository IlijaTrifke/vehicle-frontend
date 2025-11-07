import { Box, Divider, Paper, Typography } from '@mui/material'
import { formatFuel } from '../helpers/vehicleHelpers'
import type { Vehicle } from '../types/vehicle'

interface VehicleDetailsDisplayProps {
  title: string
  vehicle: Vehicle
  originalVehicle?: Vehicle | null
  mode: 'add' | 'edit'
}

export default function VehicleDetailsDisplay({
  title,
  vehicle,
  originalVehicle,
  mode,
}: VehicleDetailsDisplayProps) {
  const fields = [
    {
      label: 'Model',
      value: vehicle.model,
      originalValue: originalVehicle?.model,
    },
    {
      label: 'First registration year',
      value: vehicle.firstRegistrationYear,
      originalValue: originalVehicle?.firstRegistrationYear,
    },
    {
      label: 'Cubic capacity',
      value: `${vehicle.cubicCapacity} cm³`,
      originalValue:
        originalVehicle?.cubicCapacity !== undefined
          ? `${originalVehicle.cubicCapacity} cm³`
          : undefined,
    },
    {
      label: 'Fuel',
      value: formatFuel(vehicle.fuel),
      originalValue: originalVehicle?.fuel
        ? formatFuel(originalVehicle.fuel)
        : undefined,
    },
    {
      label: 'Mileage',
      value: `${vehicle.mileage.toLocaleString()} km`,
      originalValue:
        originalVehicle?.mileage !== undefined
          ? `${originalVehicle.mileage.toLocaleString()} km`
          : undefined,
    },
  ]

  // For edit mode, only show fields that changed
  const fieldsToDisplay =
    mode === 'edit' && originalVehicle
      ? fields.filter(
          field =>
            field.originalValue !== undefined &&
            field.originalValue !== field.value
        )
      : fields

  // Check if there are any changes (for edit mode)
  const hasChanges =
    mode === 'edit' &&
    originalVehicle &&
    fieldsToDisplay.length > 0 &&
    fieldsToDisplay.some(field => field.originalValue !== field.value)

  return (
    <Box sx={{ mt: 4 }}>
      <Divider sx={{ mb: 3 }} />
      <Paper sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 'bold', color: '#008080' }}
        >
          {title}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {mode === 'add' &&
            fieldsToDisplay.map((field, index) => (
              <Box key={index}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 'bold', mb: 0.5 }}
                >
                  {field.label}:
                </Typography>
                <Typography variant="body1">{field.value}</Typography>
              </Box>
            ))}

          {mode === 'edit' &&
            (hasChanges ? (
              fieldsToDisplay.map((field, index) => (
                <Box key={index}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 'bold', mb: 0.5 }}
                  >
                    {field.label}:
                  </Typography>
                  <Typography variant="body1">
                    {field.originalValue} → {field.value}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No changes were made.
              </Typography>
            ))}
        </Box>
      </Paper>
    </Box>
  )
}
