import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  LinearProgress,
  Pagination,
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
import { seedVehicles } from '../api/vehicleApi'
import { useDeleteVehicle } from '../hooks/useDeleteVehicle'
import type { Vehicle } from '../types/vehicle'

export default function VehiclesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { enqueueSnackbar } = useSnackbar()
  const { vehicles, loading, error, setVehicles, page, reload } =
    useVehicles(false)

  // Read page from URL, default to 1 if not present
  const urlPage = Math.max(1, Number(searchParams.get('page') || '1') || 1)
  const {
    remove: deleteVehicle,
    loading: deleting,
    error: deleteError,
  } = useDeleteVehicle()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null)
  const [seedOpen, setSeedOpen] = useState(false)
  const [seeding, setSeeding] = useState(false)

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
      const remainingVehicles = vehicles.filter(v => v.id !== vehicleToDelete)
      setVehicles(remainingVehicles)

      if (remainingVehicles.length === 0 && urlPage > 1 && page) {
        const newPage = Math.max(1, urlPage - 1)
        setSearchParams({ page: newPage.toString() }, { replace: true })
      } else {
        reload({ page: urlPage - 1 })
      }

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

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setSearchParams({ page: value.toString() })
  }

  useEffect(() => {
    if (!searchParams.get('page')) {
      setSearchParams({ page: '1' }, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    const target = Math.max(1, Number(urlPage) || 1) - 1
    if (page?.number !== target) {
      reload({ page: target })
    }
  }, [urlPage, page?.number, reload])

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [urlPage])

  // Redirect to page 1 if current page doesn't exist
  useEffect(() => {
    if (!loading && page && vehicles.length === 0 && page.totalElements > 0) {
      setSearchParams({ page: '1' }, { replace: true })
    }
  }, [loading, page, vehicles.length, setSearchParams])

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
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 2, sm: 0 },
          marginBottom: 3,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '1.7rem', sm: '2.2rem' },
          }}
        >
          Vehicle data
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setSeedOpen(true)}
            sx={{
              fontSize: { xs: '0.8rem', sm: '0.8rem' },
              py: { xs: 1, sm: 1 },
            }}
          >
            <Box
              component="span"
              sx={{ display: { xs: 'none', sm: 'inline' } }}
            >
              Seed random vehicles
            </Box>
            <Box
              component="span"
              sx={{ display: { xs: 'inline', sm: 'none' } }}
            >
              Seed vehicles
            </Box>
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<span>+</span>}
            onClick={() => navigate(`/new?fromPage=${urlPage}`)}
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
      </Box>

      {page && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Total vehicles: {page.totalElements.toLocaleString()}
        </Typography>
      )}

      {vehicles.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No vehicles found. Click "New" to add a vehicle.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          {loading && <LinearProgress />}
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() =>
                          navigate(`/${vehicle.id}?fromPage=${urlPage}`)
                        }
                        sx={{
                          backgroundColor: '#2196f3',
                          '&:hover': {
                            backgroundColor: '#1976d2',
                          },
                        }}
                      >
                        Edit
                      </Button>
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
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {page && page.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={page.totalPages}
            page={urlPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
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
                      <strong>Cubic Capacity:</strong> {vehicle.cubicCapacity}
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

      <Dialog open={seedOpen} onClose={() => setSeedOpen(false)}>
        <DialogTitle>Seed Vehicles</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This action creates and saves 10 random vehicles with valid data.
          </DialogContentText>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Each generated vehicle will have:
            </Typography>
            <Typography variant="body2">
              • Model from a predefined list (Audi A4, BMW 320, Mercedes
              C-Class, VW Golf, Toyota Corolla, Ford Focus, Opel Astra, Škoda
              Octavia, Peugeot 308, Renault Clio)
            </Typography>
            <Typography variant="body2">
              • First registration year between 2000 and 2024
            </Typography>
            <Typography variant="body2">
              • Cubic capacity between 1000 and 5000
            </Typography>
            <Typography variant="body2">
              • Fuel type: diesel, petrol, or hybrid
            </Typography>
            <Typography variant="body2">
              • Mileage between 0 and 500,000 km
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSeedOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              try {
                setSeeding(true)
                await seedVehicles()
                enqueueSnackbar('Seed completed: 10 vehicles created', {
                  variant: 'success',
                })
                setSeedOpen(false)
                reload({ page: urlPage - 1 })
              } catch {
                // errors are already shown via axios interceptor
              } finally {
                setSeeding(false)
              }
            }}
            color="primary"
            variant="contained"
            autoFocus
            loading={seeding}
          >
            Run seed
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
