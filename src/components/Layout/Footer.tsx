import { Box, Container, Typography } from '@mui/material'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <Box
      sx={{
        backgroundColor: '#008080',
        py: 3,
        marginTop: 'auto',
        boxShadow: '0 -4px 6px rgba(0,0,0,0.1)',
      }}
    >
      <Container maxWidth="xl">
        {/* Copyright */}
        <Typography
          variant="body2"
          sx={{
            textAlign: 'center',
            color: '#BDC3C7',
          }}
        >
          © {currentYear} Vehicle Manager
        </Typography>
      </Container>
    </Box>
  )
}
