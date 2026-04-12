import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import { NavLink } from 'react-router-dom'

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardRoundedIcon /> },
  { label: 'Customers', path: '/customers', icon: <Groups2RoundedIcon /> },
  { label: 'Products', path: '/products', icon: <Inventory2RoundedIcon /> },
  { label: 'Sales', path: '/sales', icon: <PointOfSaleRoundedIcon /> },
  { label: 'Reports', path: '/reports', icon: <AssessmentRoundedIcon /> },
]

function Sidebar({ drawerWidth }) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          px: 2,
        },
      }}
    >
      <Toolbar sx={{ alignItems: 'flex-start', py: 3 }}>
        <Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, #14b8a6 0%, #1d4ed8 100%)',
              mb: 2,
            }}
          >
            <StorefrontRoundedIcon sx={{ color: '#fff' }} />
          </Box>
          <Typography variant="h6" sx={{ color: '#f8fafc' }}>
            Sales Admin
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(226, 232, 240, 0.72)' }}>
            Tech company operations panel
          </Typography>
        </Box>
      </Toolbar>

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.16)', mb: 2 }} />

      <List sx={{ gap: 1, display: 'grid' }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            sx={{
              borderRadius: 3,
              color: '#cbd5e1',
              '&.active': {
                backgroundColor: 'rgba(20, 184, 166, 0.14)',
                color: '#ffffff',
              },
              '&.active .MuiListItemIcon-root': {
                color: '#5eead4',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#94a3b8', minWidth: 42 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  )
}

export default Sidebar
