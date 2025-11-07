import { useEffect, useMemo, useRef, useState } from 'react'
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
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useVehicles } from '../hooks/useVehicles'
import { seedVehicles } from '../api/vehicleApi'
import { useDeleteVehicle } from '../hooks/useDeleteVehicle'
import { useDebounce } from '../hooks/useDebounce'
import type { Vehicle } from '../types/vehicle'
import {
  parseYearRange,
  formatYearRange,
  formatFuel,
} from '../helpers/vehicleHelpers'

// Constants
const CURRENT_YEAR = new Date().getFullYear()
const DEFAULT_RANGE: [number, number] = [1900, CURRENT_YEAR]

// Types
interface Filters {
  page: number
  modelSearch: string
  fuel: string
  yearRange: [number, number]
}

export default function VehiclesPage() {
  // ========== Hooks ==========
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { enqueueSnackbar } = useSnackbar()
  const { vehicles, loading, error, setVehicles, page, reload } =
    useVehicles(false)
  const {
    remove: deleteVehicle,
    loading: deleting,
    error: deleteError,
  } = useDeleteVehicle()

  // ========== State ==========
  // Dialog states
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null)
  const [seedOpen, setSeedOpen] = useState(false)
  const [seeding, setSeeding] = useState(false)

  // Filters state (single source of truth)
  const [filters, setFilters] = useState<Filters>(() => {
    const urlPage = Math.max(1, Number(searchParams.get('page') || '1') || 1)
    const modelSearch = searchParams.get('modelSearch') || ''
    const fuel = searchParams.get('fuel') || ''
    const yearRange = parseYearRange(
      searchParams.get('firstRegistrationYear') || '',
      DEFAULT_RANGE,
      CURRENT_YEAR
    )
    return { page: urlPage, modelSearch, fuel, yearRange }
  })

  // Raw model search for TextField (without debounce)
  const [rawModelSearch, setRawModelSearch] = useState<string>(
    searchParams.get('modelSearch') || ''
  )

  // Local state for slider during dragging (visual only, no API call)
  const [sliderYearRange, setSliderYearRange] = useState<[number, number]>(
    () => {
      const yearRange = parseYearRange(
        searchParams.get('firstRegistrationYear') || '',
        DEFAULT_RANGE,
        CURRENT_YEAR
      )
      return yearRange
    }
  )

  // ========== Derived Values ==========
  const debouncedModelSearch = useDebounce(rawModelSearch, 500)
  const firstRegistrationYear = useMemo(
    () => formatYearRange(filters.yearRange, DEFAULT_RANGE, CURRENT_YEAR),
    [filters.yearRange]
  )
  const marks = useMemo(
    () => [
      { value: 1900, label: '1900' },
      { value: CURRENT_YEAR, label: String(CURRENT_YEAR) },
    ],
    []
  )

  const prevPage = useRef(filters.page)

  // ========== Effects ==========
  useEffect(() => {
    setSliderYearRange(filters.yearRange)
  }, [filters.yearRange])

  useEffect(() => {
    setFilters(prev => {
      if (prev.modelSearch !== debouncedModelSearch) {
        return {
          ...prev,
          modelSearch: debouncedModelSearch,
          page: 1,
        }
      }
      return {
        ...prev,
        modelSearch: debouncedModelSearch,
      }
    })
  }, [debouncedModelSearch])

  useEffect(() => {
    const urlFilters: Filters = {
      page: Math.max(1, Number(searchParams.get('page') || '1') || 1),
      modelSearch: searchParams.get('modelSearch') || '',
      fuel: searchParams.get('fuel') || '',
      yearRange: parseYearRange(
        searchParams.get('firstRegistrationYear') || '',
        DEFAULT_RANGE,
        CURRENT_YEAR
      ),
    }

    setFilters(prev =>
      prev.page !== urlFilters.page ||
      prev.modelSearch !== urlFilters.modelSearch ||
      prev.fuel !== urlFilters.fuel ||
      prev.yearRange[0] !== urlFilters.yearRange[0] ||
      prev.yearRange[1] !== urlFilters.yearRange[1]
        ? urlFilters
        : prev
    )

    setRawModelSearch(prev =>
      prev !== urlFilters.modelSearch ? urlFilters.modelSearch : prev
    )
  }, [searchParams])

  useEffect(() => {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev)

        ;['page', 'fuel', 'firstRegistrationYear', 'modelSearch'].forEach(k =>
          next.delete(k)
        )

        next.set('page', String(filters.page))
        if (filters.fuel) next.set('fuel', filters.fuel)
        if (firstRegistrationYear)
          next.set('firstRegistrationYear', firstRegistrationYear)
        if (filters.modelSearch) next.set('modelSearch', filters.modelSearch)

        return next.toString() === prev.toString() ? prev : next
      },
      { replace: true }
    )
  }, [
    filters.page,
    filters.fuel,
    filters.modelSearch,
    firstRegistrationYear,
    setSearchParams,
  ])

  useEffect(() => {
    const params: Record<string, string | number | undefined> = {
      page: filters.page - 1,
    }
    if (filters.fuel) {
      params.fuel = filters.fuel
    } else {
      params.fuel = undefined
    }
    if (firstRegistrationYear) {
      params.firstRegistrationYear = firstRegistrationYear
    } else {
      params.firstRegistrationYear = undefined
    }
    if (filters.modelSearch) {
      params.modelSearch = filters.modelSearch
    } else {
      params.modelSearch = undefined
    }

    reload(params)
  }, [filters, firstRegistrationYear, reload])

  useEffect(() => {
    if (prevPage.current !== filters.page) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      prevPage.current = filters.page
    }
  }, [filters.page])

  useEffect(() => {
    if (!loading && page && vehicles.length === 0 && page.totalElements > 0) {
      setFilters(prev => ({ ...prev, page: 1 }))
    }
  }, [loading, page, vehicles.length])

  // ========== Event Handlers ==========
  const handleModelSearchChange = (value: string) => {
    setRawModelSearch(value)
  }

  const handleFuelChange = (value: string) => {
    setFilters(prev => ({ ...prev, fuel: value, page: 1 }))
  }

  const handleYearRangeChange = (newRange: [number, number]) => {
    setFilters(prev => ({ ...prev, yearRange: newRange, page: 1 }))
  }

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setFilters(prev => ({ ...prev, page: value }))
  }

  const handleClearFilters = () => {
    setRawModelSearch('')
    setFilters({
      page: 1,
      modelSearch: '',
      fuel: '',
      yearRange: DEFAULT_RANGE,
    })
  }

  // Delete handlers
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

      if (remainingVehicles.length === 0 && filters.page > 1 && page) {
        setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))
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
            onClick={() => navigate(`/new?fromPage=${filters.page}`)}
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

      {/* Filters Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 'bold', color: '#008080' }}
        >
          Filters
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(12, 1fr)',
            },
            gap: 2,
          }}
        >
          <Box
            sx={{ gridColumn: { xs: 'span 1', sm: 'span 1', md: 'span 4' } }}
          >
            <TextField
              fullWidth
              label="Search Model"
              variant="outlined"
              value={rawModelSearch}
              onChange={e => handleModelSearchChange(e.target.value)}
              placeholder="Enter model name..."
              size="small"
            />
          </Box>
          <Box
            sx={{ gridColumn: { xs: 'span 1', sm: 'span 1', md: 'span 3' } }}
          >
            <FormControl fullWidth size="small">
              <InputLabel id="fuel-filter-label">Fuel Type</InputLabel>
              <Select
                labelId="fuel-filter-label"
                id="fuel-filter"
                value={filters.fuel}
                label="Fuel Type"
                onChange={e => handleFuelChange(e.target.value)}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                <MenuItem value="diesel">Diesel</MenuItem>
                <MenuItem value="petrol">Petrol</MenuItem>
                <MenuItem value="hybrid">Hybrid</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box
            sx={{
              gridColumn: { xs: 'span 1', sm: 'span 1', md: 'span 3' },
              px: 1,
            }}
          >
            <Typography
              id="year-range-slider"
              gutterBottom
              sx={{ fontSize: '0.875rem', mb: 1 }}
            >
              Registration Year: {sliderYearRange[0]} - {sliderYearRange[1]}
            </Typography>
            <Slider
              value={sliderYearRange}
              onChange={(_, newValue) => {
                // Only update visual state during dragging, no API call
                setSliderYearRange(newValue as [number, number])
              }}
              onChangeCommitted={(_, newValue) => {
                // Commit: update filters and trigger API call
                handleYearRangeChange(newValue as [number, number])
              }}
              valueLabelDisplay="auto"
              min={1900}
              max={CURRENT_YEAR}
              aria-labelledby="year-range-slider"
              marks={marks}
            />
          </Box>
          <Box
            sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 2' } }}
          >
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={handleClearFilters}
              sx={{ height: '40px' }}
            >
              Clear Filters
            </Button>
          </Box>
        </Box>
      </Paper>

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
                          navigate(`/${vehicle.id}?fromPage=${filters.page}`)
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
            page={filters.page}
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
                // Trigger reload by updating filters (page stays the same)
                setFilters(prev => ({ ...prev }))
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
