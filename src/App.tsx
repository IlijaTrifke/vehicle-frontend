import { RouterProvider } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import { router } from './router'
import './App.css'

function App() {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <RouterProvider router={router} />
    </SnackbarProvider>
  )
}

export default App
