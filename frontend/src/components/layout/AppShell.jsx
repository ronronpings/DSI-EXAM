import { Box, Toolbar } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

const drawerWidth = 280

function AppShell() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Sidebar drawerWidth={drawerWidth} />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Topbar drawerWidth={drawerWidth} />
        <Toolbar />
        <Box
          component="main"
          sx={{
            p: { xs: 2, md: 4 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default AppShell
