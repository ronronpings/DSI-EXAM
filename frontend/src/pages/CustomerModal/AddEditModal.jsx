import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  MenuItem,
} from '@mui/material'
import toast from 'react-hot-toast'
import api from '../../api/axios.js'
import getApiErrorMessage from '../../utils/getApiErrorMessage.js'

const initialForm = {
  customer_code: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  is_active: true,
}

export default function CustomerModal({ open, onClose, editingCustomer, onSuccess }) {
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editingCustomer) {
      setForm({
        customer_code: editingCustomer.customer_code ?? '',
        first_name: editingCustomer.first_name ?? '',
        last_name: editingCustomer.last_name ?? '',
        email: editingCustomer.email ?? '',
        phone: editingCustomer.phone ?? '',
        address: editingCustomer.address ?? '',
        is_active: Boolean(editingCustomer.is_active),
      })
    } else {
      setForm(initialForm)
    }
  }, [editingCustomer, open])

  const handleChange = (event) => {
    const { name, value } = event.target

    if (name === 'is_active') {
      setForm((current) => ({ ...current, is_active: value === 'true' }))
    }

    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setSaving(true)

      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, form)
        toast.success('Customer updated successfully.')
      } else {
        await api.post('/customers', form)
        toast.success('Customer created successfully.')
      }

      onSuccess()
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save customer.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={() => !saving && onClose()} fullWidth maxWidth="sm">
      <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Customer Code" name="customer_code" value={form.customer_code} onChange={handleChange} required />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="First Name" name="first_name" value={form.first_name} onChange={handleChange} fullWidth required />
              <TextField label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} fullWidth required />
            </Stack>
            <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
            <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} />
            <TextField label="Address" name="address" value={form.address} onChange={handleChange} multiline minRows={3} />
            <TextField select label="Status" name="is_active" value={String(form.is_active)} onChange={handleChange}>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Create Customer'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
