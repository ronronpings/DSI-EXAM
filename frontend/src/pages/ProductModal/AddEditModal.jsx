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
  sku: '',
  name: '',
  description: '',
  price: '',
  stock_quantity: '',
  is_active: true,
}

export default function ProductModal({ open, onClose, editingProduct, onSuccess }) {
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editingProduct) {
      setForm({
        sku: editingProduct.sku ?? '',
        name: editingProduct.name ?? '',
        description: editingProduct.description ?? '',
        price: editingProduct.price ?? '',
        stock_quantity: editingProduct.stock_quantity ?? '',
        is_active: Boolean(editingProduct.is_active),
      })
    } else {
      setForm(initialForm)
    }
  }, [editingProduct, open])

  const handleChange = (event) => {
    const { name, value } = event.target

    if (name === 'is_active') {
      setForm((current) => ({ ...current, is_active: value === 'true' }))
      return
    }

    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload = {
      ...form,
      price: Number(form.price),
      stock_quantity: Number(form.stock_quantity),
    }

    try {
      setSaving(true)

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload)
        toast.success('Product updated successfully.')
      } else {
        await api.post('/products', payload)
        toast.success('Product created successfully.')
      }

      onSuccess()
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save product.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={() => !saving && onClose()} fullWidth maxWidth="sm">
      <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="SKU" name="sku" value={form.sku} onChange={handleChange} required />
            <TextField label="Name" name="name" value={form.name} onChange={handleChange} required />
            <TextField label="Description" name="description" value={form.description} onChange={handleChange} multiline minRows={3} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Price" name="price" type="number" inputProps={{ min: 0, step: '0.01' }} value={form.price} onChange={handleChange} fullWidth required />
              <TextField label="Stock Quantity" name="stock_quantity" type="number" inputProps={{ min: 0 }} value={form.stock_quantity} onChange={handleChange} fullWidth required />
            </Stack>
            <TextField select label="Status" name="is_active" value={String(form.is_active)} onChange={handleChange}>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
