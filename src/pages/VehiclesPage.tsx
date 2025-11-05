import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
} from '@mui/material'
import { useVehicles } from '../hooks/useVehicles'
import { useDeleteVehicle } from '../hooks/useDeleteVehicle'
import type { Vehicle } from '../types/vehicle'

export default function VehiclesPage() {
  const navigate = useNavigate()
  const { vehicles, loading, error, setVehicles } = useVehicles()
  const { remove: deleteVehicle, loading: deleting } = useDeleteVehicle()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return
    }

    setDeletingId(id)
    const success = await deleteVehicle(id)
    if (success) {
      // Optimistic update - remove from local state
      setVehicles(prev => prev.filter(v => v.id !== id))
    }
    setDeletingId(null)
  }

  const formatFuel = (fuel: string) => {
    return fuel.charAt(0).toUpperCase() + fuel.slice(1)
  }

  if (loading && vehicles.length === 0) {
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

  if (error) {
    return (
      <Alert severity="error">
        {error.detail || error.title || 'Error loading vehicles'}
      </Alert>
    )
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 3,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Vehicle data
        </Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<span>+</span>}
          onClick={() => navigate('/new')}
          sx={{
            backgroundColor: '#4caf50',
            '&:hover': {
              backgroundColor: '#45a049',
            },
          }}
        >
          New
        </Button>
      </Box>

      {vehicles.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No vehicles found. Click "New" to add a vehicle.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#008080' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  ID
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Model
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  First registration year
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Cubic capacity
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Fuel
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Mileage
                </TableCell>
                <TableCell
                  sx={{ color: 'white', fontWeight: 'bold' }}
                ></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.map((vehicle: Vehicle) => (
                <TableRow key={vehicle.id} hover>
                  <TableCell>{vehicle.id}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.firstRegistrationYear}</TableCell>
                  <TableCell>{vehicle.cubicCapacity}</TableCell>
                  <TableCell>{formatFuel(vehicle.fuel)}</TableCell>
                  <TableCell>{vehicle.mileage.toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(vehicle.id)}
                      disabled={deleting && deletingId === vehicle.id}
                      sx={{
                        backgroundColor: '#f44336',
                        '&:hover': {
                          backgroundColor: '#da190b',
                        },
                      }}
                    >
                      {deleting && deletingId === vehicle.id
                        ? 'Deleting...'
                        : 'Delete'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
