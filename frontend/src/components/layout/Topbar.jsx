import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import {
  AppBar,
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'

const titles = {
  '/dashboard': 'Business Overview',
  '/customers': 'Customer Management',
  '/products': 'Product Inventory',
  '/sales': 'Sales Transactions',
  '/reports': 'Sales Reports',
}

function Topbar({ drawerWidth }) {
  const location = useLocation()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = async () => {
     try {
      await api.post('/auth/logout')
    } catch {
      // Ignore logout API failures and still clear local session.
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login', { replace: true })
    }
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: '74px !important' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.12em' }}>
            Tech Sales Management System
          </Typography>
          <Typography variant="h6">{titles[location.pathname] ?? 'Sales Platform'}</Typography>
        </Box>

        <TextField
          size="small"
          placeholder="Search module..."
          sx={{
            width: 260,
            display: { xs: 'none', lg: 'flex' },
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#ffffff',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Button color="inherit" startIcon={<LogoutRoundedIcon />} onClick={handleLogout}>
          Logout
        </Button>

        <IconButton
          sx={{
            width: 40,
            height: 40,
            backgroundColor: '#0f172a',
            color: '#fff',
            '&:hover': { backgroundColor: '#1e293b' },
          }}
        >
          {(user.name?.[0] || '').toUpperCase()}
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

export default Topbar
