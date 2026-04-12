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
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios.js'
import getApiErrorMessage from '../../utils/getApiErrorMessage.js'

function AssignRoleModal({ open, onClose, selectedUser, onSuccess }) {
  const [roles, setRoles] = useState([])
  const [selectedRoles, setSelectedRoles] = useState([])
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !selectedUser) return

    setSelectedRoles((selectedUser.roles ?? []).map((role) => role.id))
    fetchRoles()
  }, [open, selectedUser])

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

  const toggleRole = (roleId) => {
    setSelectedRoles((current) =>
      current.includes(roleId)
        ? current.filter((id) => id !== roleId)
        : [...current, roleId],
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setSaving(true)

      await api.post(`/users/${selectedUser.id}/assign-roles`, {
        roles: selectedRoles,
      })

      toast.success('Roles assigned successfully.')
      onClose()
      onSuccess()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to assign roles.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign Roles</DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography color="text.secondary">
              {selectedUser?.name} ({selectedUser?.email})
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
                        checked={selectedRoles.includes(role.id)}
                        onChange={() => toggleRole(role.id)}
                      />
                    }
                    label={`${role.display_name} (${role.name})`}
                  />
                ))
              )}
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Assign Roles'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default AssignRoleModal
