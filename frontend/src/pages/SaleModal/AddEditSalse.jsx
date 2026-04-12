import { useEffect, useState } from 'react'
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded'
import toast from 'react-hot-toast'
import api from '../../api/axios.js'
import getApiErrorMessage from '../../utils/getApiErrorMessage.js'

function getDefaultSoldAt() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

function formatDateTimeForBackend(value) {
  return value ? value.replace('T', ' ') + ':00' : ''
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(value ?? 0))
}

function computeSaleSummary(items, products, taxValue, discountValue) {
  const subtotal = items.reduce((sum, item) => {
    const product = products.find((entry) => String(entry.id) === String(item.product_id))
    const unitPrice = Number(product?.price ?? 0)
    return sum + unitPrice * Number(item.quantity || 0)
  }, 0)

  const tax = Number(taxValue || 0)
  const discount = Number(discountValue || 0)

  return {
    subtotal,
    tax,
    discount,
    total: Math.max(subtotal + tax - discount, 0),
  }
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography color={strong ? 'text.primary' : 'text.secondary'} fontWeight={strong ? 700 : 500}>
        {label}
      </Typography>
      <Typography fontWeight={strong ? 700 : 600}>{value}</Typography>
    </Stack>
  )
}

const initialSaleForm = {
  customer_id: '',
  sold_at: getDefaultSoldAt(),
  status: 'paid',
  tax: '0',
  discount: '0',
  items: [{ product_id: '', quantity: 1 }],
}

export function CreateSaleModal({ open, onClose, onSuccess, customers, products }) {
  const [saleForm, setSaleForm] = useState(initialSaleForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setSaleForm(initialSaleForm)
    }
  }, [open])

  const handleSaleFieldChange = (event) => {
    const { name, value } = event.target
    setSaleForm((current) => ({ ...current, [name]: value }))
  }

  const handleItemChange = (index, field, value) => {
    setSaleForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: field === 'quantity' ? Number(value) : value } : item,
      ),
    }))
  }

  const addItemRow = () => {
    setSaleForm((current) => ({
      ...current,
      items: [...current.items, { product_id: '', quantity: 1 }],
    }))
  }

  const removeItemRow = (index) => {
    setSaleForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const handleCreateSale = async (event) => {
    event.preventDefault()

    const payload = {
      customer_id: Number(saleForm.customer_id),
      sold_at: formatDateTimeForBackend(saleForm.sold_at),
      status: saleForm.status,
      tax: Number(saleForm.tax || 0),
      discount: Number(saleForm.discount || 0),
      items: saleForm.items.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      })),
    }

    try {
      setSaving(true)
      await api.post('/sales', payload)
      toast.success('Sale created successfully.')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create sale.'))
    } finally {
      setSaving(false)
    }
  }

  const summary = computeSaleSummary(saleForm.items, products, saleForm.tax, saleForm.discount)

  return (
    <Dialog open={open} onClose={() => !saving && onClose()} fullWidth maxWidth="md">
      <DialogTitle>Create Sale</DialogTitle>
      <Box component="form" onSubmit={handleCreateSale}>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Autocomplete
                fullWidth
                options={customers.filter((c) => Boolean(c.is_active))}
                getOptionLabel={(option) => `${option.customer_code} - ${option.first_name} ${option.last_name}`}
                value={customers.find((c) => c.id === saleForm.customer_id) || null}
                onChange={(_, newValue) => {
                  setSaleForm((current) => ({ ...current, customer_id: newValue?.id || '' }))
                }}
                renderInput={(params) => <TextField {...params} label="Customer" required />}
              />

              <TextField
                label="Sold At"
                name="sold_at"
                type="datetime-local"
                value={saleForm.sold_at}
                onChange={handleSaleFieldChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                select
                label="Status"
                name="status"
                value={saleForm.status}
                onChange={handleSaleFieldChange}
                fullWidth
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>

              <TextField
                label="Tax"
                name="tax"
                type="number"
                inputProps={{ min: 0, step: '0.01' }}
                value={saleForm.tax}
                onChange={handleSaleFieldChange}
                fullWidth
              />

              <TextField
                label="Discount"
                name="discount"
                type="number"
                inputProps={{ min: 0, step: '0.01' }}
                value={saleForm.discount}
                onChange={handleSaleFieldChange}
                fullWidth
              />
            </Stack>

            <Divider />

            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Items</Typography>
                <Button onClick={addItemRow}>Add Row</Button>
              </Stack>

              {saleForm.items.map((item, index) => (
                <Stack key={index} direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                  <Autocomplete
                    fullWidth
                    options={products}
                    getOptionLabel={(option) => `${option.sku} - ${option.name} (${option.stock_quantity} stock)`}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    value={products.find((p) => p.id === item.product_id) || null}
                    onChange={(_, newValue) => handleItemChange(index, 'product_id', newValue?.id || '')}
                    renderInput={(params) => <TextField {...params} label={`Product ${index + 1}`} required />}
                  />

                  <TextField
                    label="Quantity"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={item.quantity}
                    onChange={(event) => handleItemChange(index, 'quantity', event.target.value)}
                    sx={{ width: { xs: '100%', md: 160 } }}
                    required
                  />

                  <IconButton
                    color="error"
                    disabled={saleForm.items.length === 1}
                    onClick={() => removeItemRow(index)}
                  >
                    <RemoveCircleOutlineRoundedIcon />
                  </IconButton>
                </Stack>
              ))}
            </Stack>

            <Card variant="outlined">
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Order Summary
                  </Typography>
                  <SummaryRow label="Subtotal" value={formatCurrency(summary.subtotal)} />
                  <SummaryRow label="Tax" value={formatCurrency(summary.tax)} />
                  <SummaryRow label="Discount" value={formatCurrency(summary.discount)} />
                  <SummaryRow label="Total" value={formatCurrency(summary.total)} strong />
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Create Sale'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export function UpdateStatusModal({ open, onClose, onSuccess, selectedSale }) {
  const [statusForm, setStatusForm] = useState({ status: 'paid' })
  const [statusSaving, setStatusSaving] = useState(false)

  useEffect(() => {
    if (selectedSale) {
      setStatusForm({ status: selectedSale.status })
    }
  }, [selectedSale])

  const handleUpdateStatus = async (event) => {
    event.preventDefault()

    try {
      setStatusSaving(true)
      await api.put(`/sales/${selectedSale.id}`, statusForm)
      toast.success('Sale status updated successfully.')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update sale status.'))
    } finally {
      setStatusSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={() => !statusSaving && onClose()} fullWidth maxWidth="xs">
      <DialogTitle>Update Sale Status</DialogTitle>
      <Box component="form" onSubmit={handleUpdateStatus}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography color="text.secondary">
              {selectedSale?.invoice_number}
            </Typography>

            <TextField
              select
              label="Status"
              value={statusForm.status}
              onChange={(event) => setStatusForm({ status: event.target.value })}
              fullWidth
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={statusSaving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={statusSaving}>
            {statusSaving ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
