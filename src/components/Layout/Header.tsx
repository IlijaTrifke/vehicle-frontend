import { AppBar, Typography } from '@mui/material'

export function Header() {
  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: '#008080', // teal color
        padding: '1rem 0',
      }}
    >
      <Typography
        variant="h6"
        component="div"
        sx={{
          textAlign: 'center',
          color: 'white',
          fontWeight: 'normal',
        }}
      >
        Header
      </Typography>
    </AppBar>
  )
}
