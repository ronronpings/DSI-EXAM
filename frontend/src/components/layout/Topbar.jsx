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
  '/users': 'User Management',
}

import { useAuth } from '../../utils/AuthContext.jsx'

function Topbar({ drawerWidth }) {
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
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
          {(user?.name?.[0] || '').toUpperCase()}
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

export default Topbar
