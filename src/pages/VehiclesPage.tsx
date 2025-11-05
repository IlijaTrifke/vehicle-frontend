import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useVehicles } from '../hooks/useVehicles'
import { useDeleteVehicle } from '../hooks/useDeleteVehicle'
import type { Vehicle } from '../types/vehicle'

export default function VehiclesPage() {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const { vehicles, loading, error, setVehicles } = useVehicles()
  const {
    remove: deleteVehicle,
    loading: deleting,
    error: deleteError,
  } = useDeleteVehicle()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null)

  const handleDeleteClick = (id: number) => {
    setVehicleToDelete(id)
    setDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete) return

    setDialogOpen(false)
    setDeletingId(vehicleToDelete)
    const success = await deleteVehicle(vehicleToDelete)
    if (success) {
      // Optimistic update - remove from local state
      setVehicles(prev => prev.filter(v => v.id !== vehicleToDelete))
      enqueueSnackbar('Vehicle deleted successfully', { variant: 'success' })
    } else if (deleteError) {
      enqueueSnackbar(
        deleteError.detail || deleteError.title || 'Error deleting vehicle',
        { variant: 'error' }
      )
    }
    setDeletingId(null)
    setVehicleToDelete(null)
  }

  const handleDeleteCancel = () => {
    setDialogOpen(false)
    setVehicleToDelete(null)
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
                      onClick={() => handleDeleteClick(vehicle.id)}
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

      <Dialog
        open={dialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Vehicle</DialogTitle>
        <DialogContent>
          {vehicleToDelete &&
            (() => {
              const vehicle = vehicles.find(v => v.id === vehicleToDelete)
              if (!vehicle) return null

              return (
                <Box sx={{ mb: 2 }}>
                  <DialogContentText
                    id="delete-dialog-description"
                    sx={{ mb: 2 }}
                  >
                    Are you sure you want to delete this vehicle? This action
                    cannot be undone.
                  </DialogContentText>
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 'bold', mb: 1 }}
                    >
                      Vehicle Details:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>ID:</strong> {vehicle.id}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Model:</strong> {vehicle.model}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>First Registration Year:</strong>{' '}
                      {vehicle.firstRegistrationYear}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Cubic Capacity:</strong> {vehicle.cubicCapacity}{' '}
                      cc
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Fuel:</strong> {formatFuel(vehicle.fuel)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Mileage:</strong>{' '}
                      {vehicle.mileage.toLocaleString()} km
                    </Typography>
                  </Box>
                </Box>
              )
            })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
