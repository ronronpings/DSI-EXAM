import AddRoundedIcon from '@mui/icons-material/AddRounded'
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import KeyRoundedIcon from '@mui/icons-material/KeyRounded'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useDeferredValue, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios.js'
import getApiErrorMessage from '../utils/getApiErrorMessage.js'
import AddEditModal from './UserModal/AddEditModal.jsx'
import AssignRoleModal from './UserModal/AssignRoleModal.jsx'
import AssignPermissionModal from './UserModal/AssignPermissionModal.jsx'
import { useAuth } from '../utils/AuthContext.jsx'

function UsersPage() {
  const { hasPermission } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const [permissionOpen, setPermissionOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    total: 0,
  })

  useEffect(() => {
    fetchUsers()
  }, [pagination.page, pagination.rowsPerPage, deferredSearch])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      const { data } = await api.get('/users', {
        params: {
          page: pagination.page + 1,
          per_page: pagination.rowsPerPage,
          search: deferredSearch || undefined,
        },
      })

      setUsers(data.data ?? [])
      setPagination((current) => ({
        ...current,
        total: data.total ?? 0,
      }))
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load users.'))
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingUser(null)
    setOpen(true)
  }

  const handleOpenEdit = (user) => {
    setEditingUser(user)
    setOpen(true)
  }

  const handleOpenAssignRole = (user) => {
    setSelectedUser(user)
    setRoleOpen(true)
  }

  const handleOpenAssignPermission = (user) => {
    setSelectedUser(user)
    setPermissionOpen(true)
  }

  const handleDelete = async (user) => {
    const confirmed = window.confirm(`Delete user ${user.name}?`)

    if (!confirmed) return

    try {
      await api.delete(`/users/${user.id}`)
      toast.success('User deleted successfully.')

      if (users.length === 1 && pagination.page > 0) {
        setPagination((current) => ({ ...current, page: current.page - 1 }))
      } else {
        fetchUsers()
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete user.'))
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ width: '100%' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            Users
          </Typography>
          <Typography color="text.secondary">
            Manage user accounts, access levels, and application roles.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleOpenCreate}
          sx={{ 
            height: 'fit-content', 
            px: 3, 
            mt: 0.5,
            display: hasPermission('users.create') ? 'inline-flex' : 'none'
          }}
        >
          Add User
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <TextField
              placeholder="Search by name or email"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPagination((current) => ({ ...current, page: 0 }))
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Roles</TableCell>
                    <TableCell>Direct Permissions</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <CircularProgress size={24} sx={{ my: 4 }} />
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary" py={4}>
                          No users found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {(user.roles ?? []).length ? (
                              user.roles.map((role) => (
                                <Chip key={role.id} label={role.display_name} size="small" color="primary" variant="outlined" />
                              ))
                            ) : (
                              <Chip label="No roles" size="small" variant="outlined" />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {(user.permissions ?? []).length ? (
                              user.permissions.map((perm) => (
                                <Chip key={perm.id} label={perm.display_name} size="small" color="secondary" variant="outlined" />
                              ))
                            ) : (
                              <Chip label="No direct permissions" size="small" variant="outlined" sx={{ opacity: 0.5 }} />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          {hasPermission('users.assign_roles') && (
                            <IconButton color="primary" onClick={() => handleOpenAssignRole(user)} title="Assign Roles">
                              <AdminPanelSettingsRoundedIcon />
                            </IconButton>
                          )}
                          {hasPermission('users.assign_permissions') && (
                            <IconButton color="secondary" onClick={() => handleOpenAssignPermission(user)} title="Assign Permissions">
                              <KeyRoundedIcon />
                            </IconButton>
                          )}
                          {hasPermission('users.update') && (
                            <IconButton color="primary" onClick={() => handleOpenEdit(user)} title="Edit User">
                              <EditRoundedIcon />
                            </IconButton>
                          )}
                          {hasPermission('users.delete') && (
                            <IconButton color="error" onClick={() => handleDelete(user)} title="Delete User">
                              <DeleteOutlineRoundedIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={pagination.total}
              page={pagination.page}
              onPageChange={(_, nextPage) => setPagination((current) => ({ ...current, page: nextPage }))}
              rowsPerPage={pagination.rowsPerPage}
              onRowsPerPageChange={(event) =>
                setPagination({
                  page: 0,
                  rowsPerPage: parseInt(event.target.value, 10),
                  total: pagination.total,
                })
              }
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Stack>
        </CardContent>
      </Card>

      <AddEditModal
        open={open}
        onClose={() => setOpen(false)}
        editingUser={editingUser}
        onSuccess={fetchUsers}
      />

      <AssignRoleModal
        open={roleOpen}
        onClose={() => {
          setRoleOpen(false)
          setSelectedUser(null)
        }}
        selectedUser={selectedUser}
        onSuccess={fetchUsers}
      />

      <AssignPermissionModal
        open={permissionOpen}
        onClose={() => {
          setPermissionOpen(false)
          setSelectedUser(null)
        }}
        selectedUser={selectedUser}
        onSuccess={fetchUsers}
      />
    </Stack>
  )
}

export default UsersPage
