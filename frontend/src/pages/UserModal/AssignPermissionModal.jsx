import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios.js'
import getApiErrorMessage from '../../utils/getApiErrorMessage.js'

function AssignPermissionModal({ open, onClose, selectedUser, onSuccess }) {
  const [permissions, setPermissions] = useState([])
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const [loadingPermissions, setLoadingPermissions] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !selectedUser) return

    setSelectedPermissions((selectedUser.permissions ?? []).map((p) => p.id))
    fetchPermissions()
  }, [open, selectedUser])

  const fetchPermissions = async () => {
    try {
      setLoadingPermissions(true)
      const { data } = await api.get('/users/permissions')
      setPermissions(data.data ?? [])
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load permissions.'))
    } finally {
      setLoadingPermissions(false)
    }
  }

  const groupedPermissions = useMemo(() => {
    return permissions.reduce((acc, permission) => {
      let groupName = 'General'
      if (permission.name.includes('.')) {
        const [group] = permission.name.split('.')
        groupName = group.charAt(0).toUpperCase() + group.slice(1)
      } else if (permission.name.includes('_')) {
        const [group] = permission.name.split('_')
        groupName = group.charAt(0).toUpperCase() + group.slice(1)
      }
      
      if (!acc[groupName]) acc[groupName] = []
      acc[groupName].push(permission)
      return acc
    }, {})
  }, [permissions])

  const togglePermission = (permissionId) => {
    setSelectedPermissions((current) =>
      current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId],
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setSaving(true)

      await api.post(`/users/${selectedUser.id}/assign-permissions`, {
        permissions: selectedPermissions,
      })

      toast.success('Permissions assigned successfully.')
      onClose()
      onSuccess()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to assign permissions.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>Assign Direct Permissions</DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ minHeight: 400 }}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Typography color="text.secondary">
              Direct permissions for <strong>{selectedUser?.name}</strong>. Note: These are in addition to permissions granted via roles.
            </Typography>

            {loadingPermissions ? (
              <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
                <Typography color="text.secondary">Loading permissions...</Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                {Object.entries(groupedPermissions).map(([group, list]) => (
                  <Box key={group}>
                    <Typography 
                      variant="subtitle2" 
                      color="primary" 
                      sx={{ 
                        mb: 1.5, 
                        fontWeight: 700, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      {group}
                      <Divider sx={{ flexGrow: 1, opacity: 0.6 }} />
                    </Typography>
                    <Grid container spacing={1}>
                      {list.map((permission) => (
                        <Grid item xs={12} sm={6} md={4} key={permission.id}>
                          <FormControlLabel
                            sx={{
                              width: '100%',
                              mr: 0,
                              p: 0.5,
                              borderRadius: 1,
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                            control={
                              <Checkbox
                                size="small"
                                checked={selectedPermissions.includes(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{permission.display_name}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>
                                  {permission.name}
                                </Typography>
                              </Box>
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 2, borderTop: '1px solid rgba(148, 163, 184, 0.12)' }}>
          <Button onClick={onClose} disabled={saving} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Assign Permissions'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default AssignPermissionModal
