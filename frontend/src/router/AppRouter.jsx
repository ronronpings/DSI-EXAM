import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from '../components/layout/AppShell.jsx'
import CustomersPage from '../pages/CustomersPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import ProductsPage from '../pages/ProductsPage.jsx'
import ReportsPage from '../pages/ReportsPage.jsx'
import SalesPage from '../pages/SalesPage.jsx'
import UsersPage from '../pages/UsersPage.jsx'

function ProtectedLayout() {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <AppShell />
}

function PublicOnlyRoute({ children }) {
  const token = localStorage.getItem('token')

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
