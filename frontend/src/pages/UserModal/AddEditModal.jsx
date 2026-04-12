import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios.js'
import getApiErrorMessage from '../../utils/getApiErrorMessage.js'

const initialForm = {
  name: '',
  email: '',
  password: '',
  roles: [],
}

function AddEditModal({ open, onClose, editingUser, onSuccess }) {
  const [roles, setRoles] = useState([])
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    if (!open) return

    fetchRoles()

    if (editingUser) {
      setForm({
        name: editingUser.name ?? '',
        email: editingUser.email ?? '',
        password: '',
        roles: (editingUser.roles ?? []).map((role) => role.id),
      })
    } else {
      setForm(initialForm)
    }
  }, [open, editingUser])

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true)
      const { data } = await api.get('/users/roles')
      setRoles(data.data ?? [])
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load roles.'))
    } finally {
      setLoadingRoles(false)
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const toggleRole = (roleId) => {
    setForm((current) => ({
      ...current,
      roles: current.roles.includes(roleId)
        ? current.roles.filter((id) => id !== roleId)
        : [...current.roles, roleId],
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload = {
      name: form.name,
      email: form.email,
      roles: form.roles,
    }

    if (form.password) {
      payload.password = form.password
    }

    if (!editingUser && !form.password) {
      toast.error('Password is required for new users.')
      return
    }

    try {
      setSaving(true)

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload)
        toast.success('User updated successfully.')
      } else {
        await api.post('/users', payload)
        toast.success('User created successfully.')
      }

      onClose()
      onSuccess()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save user.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <TextField
              label={editingUser ? 'New Password (optional)' : 'Password'}
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required={!editingUser}
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Roles
              </Typography>

              <Stack>
                {loadingRoles ? (
                  <Typography color="text.secondary">Loading roles...</Typography>
                ) : (
                  roles.map((role) => (
                    <FormControlLabel
                      key={role.id}
                      control={
                        <Checkbox
                          checked={form.roles.includes(role.id)}
                          onChange={() => toggleRole(role.id)}
                        />
                      }
                      label={`${role.display_name} (${role.name})`}
                    />
                  ))
                )}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default AddEditModal
