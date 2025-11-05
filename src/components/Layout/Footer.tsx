import { Box, Typography } from '@mui/material'

export function Footer() {
  return (
    <Box
      sx={{
        backgroundColor: '#E0E0E0', // light gray
        padding: '1rem 0',
        marginTop: 'auto',
      }}
    >
      <Typography
        variant="body1"
        component="div"
        sx={{
          textAlign: 'center',
          color: 'black',
        }}
      >
        Footer
      </Typography>
    </Box>
  )
}
