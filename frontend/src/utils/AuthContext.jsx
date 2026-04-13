import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext({
  user: null,
  permissions: [],
  loading: true,
  login: () => {},
  logout: () => {},
  hasPermission: () => false,
  checkAuth: () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setPermissions([])
      setLoading(false)
      return
    }

    try {
      const { data } = await api.get('/auth/me')
      setUser(data.user)
      setPermissions(data.permissions)
    } catch (error) {
      localStorage.removeItem('token')
      setUser(null)
      setPermissions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = (userData, token) => {
    localStorage.setItem('token', token)
    checkAuth()
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      setPermissions([])
    }
  }

  const hasPermission = (permission) => {
    if (!permission) return true
    return permissions.includes(permission)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        loading,
        login,
        logout,
        hasPermission,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
