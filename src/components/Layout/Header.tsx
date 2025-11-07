import {
  AppBar,
  Container,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import HomeIcon from '@mui/icons-material/Home'
import { useNavigate } from 'react-router-dom'

export function Header() {
  const navigate = useNavigate()

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: '#008080',
        py: 2,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DirectionsCarIcon sx={{ fontSize: 40, color: 'white' }} />
            <Box>
              <Typography
                variant="h5"
                component="div"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  letterSpacing: 1,
                }}
              >
                Vehicle Manager
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  fontStyle: 'italic',
                }}
              >
                Fleet Management System
              </Typography>
            </Box>
          </Box>

          {/* Navigation */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Home">
              <IconButton sx={{ color: 'white' }} onClick={() => navigate('/')}>
                <HomeIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Container>
    </AppBar>
  )
}
