import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './components/Layout/AppLayout'
import VehiclesPage from './pages/VehiclesPage'
import NewVehiclePage from './pages/NewVehiclePage'
import EditVehiclePage from './pages/EditVehiclePage'
import NotFoundPage from './pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <VehiclesPage /> },
      { path: 'new', element: <NewVehiclePage /> },
      { path: ':id', element: <EditVehiclePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
