import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import theme from './theme/theme.js'
import './index.css'
import { AuthProvider } from './utils/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Toast notification */}
      <Toaster 
       position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            background: '#0f172a',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#14b8a6',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <AuthProvider>
        <App />
      </AuthProvider>
      
    </ThemeProvider>
  </StrictMode>,
)
