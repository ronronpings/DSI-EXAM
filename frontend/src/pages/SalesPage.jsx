import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
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

const initialSaleForm = {
  customer_id: '',
  sold_at: getDefaultSoldAt(),
  status: 'paid',
  tax: '0',
  discount: '0',
  items: [{ product_id: '', quantity: 1 }],
}

function SalesPage() {
  const [sales, setSales] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusSaving, setStatusSaving] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)
  const [saleForm, setSaleForm] = useState(initialSaleForm)
  const [statusForm, setStatusForm] = useState({ status: 'paid' })
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    total: 0,
  })

  useEffect(() => {
    fetchSales()
  }, [pagination.page, pagination.rowsPerPage, deferredSearch])

  const fetchSales = async () => {
    try {
      setLoading(true)

      const statusFilter = deferredSearch && ['paid', 'pending', 'cancelled'].includes(deferredSearch.toLowerCase())
        ? deferredSearch.toLowerCase()
        : undefined

      const { data } = await api.get('/sales', {
        params: {
          page: pagination.page + 1,
          per_page: pagination.rowsPerPage,
          status: statusFilter,
        },
      })

      setSales(data.data ?? [])
      setPagination((current) => ({
        ...current,
        total: data.total ?? 0,
      }))
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load sales.'))
    } finally {
      setLoading(false)
    }
  }

  const fetchLookups = async () => {
    try {
      const [customersResponse, productsResponse] = await Promise.all([
        api.get('/customers', { params: { per_page: 100 } }),
        api.get('/products', { params: { per_page: 100, is_active: true } }),
      ])

      setCustomers(customersResponse.data.data ?? [])
      setProducts(productsResponse.data.data ?? [])
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load form options.'))
    }
  }

  const openCreateDialog = async () => {
    setSaleForm(initialSaleForm)
    await fetchLookups()
    setCreateOpen(true)
  }

  const closeCreateDialog = () => {
    if (saving) return
    setCreateOpen(false)
  }

  const openStatusDialog = (sale) => {
    setSelectedSale(sale)
    setStatusForm({ status: sale.status })
    setStatusOpen(true)
  }

  const closeStatusDialog = () => {
    if (statusSaving) return
    setStatusOpen(false)
    setSelectedSale(null)
  }

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
      setCreateOpen(false)
      fetchSales()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create sale.'))
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateStatus = async (event) => {
    event.preventDefault()

    try {
      setStatusSaving(true)
      await api.put(`/sales/${selectedSale.id}`, statusForm)
      toast.success('Sale status updated successfully.')
      setStatusOpen(false)
      setSelectedSale(null)
      fetchSales()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update sale status.'))
    } finally {
      setStatusSaving(false)
    }
  }

  const handleDeleteSale = async (sale) => {
    const confirmed = window.confirm(`Delete sale ${sale.invoice_number}? This only works for cancelled sales.`)

    if (!confirmed) return

    try {
      await api.delete(`/sales/${sale.id}`)
      toast.success('Sale deleted successfully.')

      if (sales.length === 1 && pagination.page > 0) {
        setPagination((current) => ({ ...current, page: current.page - 1 }))
      } else {
        fetchSales()
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete sale.'))
    }
  }

  const summary = computeSaleSummary(saleForm.items, products, saleForm.tax, saleForm.discount)

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="h4" gutterBottom>
            Sales
          </Typography>
          <Typography color="text.secondary">
            Create transactions, review invoices, and update sale status.
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreateDialog}>
          Create Sale
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <TextField
              placeholder="Quick filter by status: paid, pending, cancelled"
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
                    <TableCell>Invoice</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Cashier</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Sold At</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" py={4}>
                          <CircularProgress size={24} />
                          <Typography color="text.secondary">Loading sales...</Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ) : sales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Typography color="text.secondary" textAlign="center" py={4}>
                          No sales found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sales.map((sale) => (
                      <TableRow key={sale.id} hover>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography fontWeight={600}>{sale.invoice_number}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {sale.items?.length ?? 0} item(s)
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{formatCustomerName(sale.customer)}</TableCell>
                        <TableCell>{sale.cashier?.name ?? 'N/A'}</TableCell>
                        <TableCell>{formatCurrency(sale.total_amount)}</TableCell>
                        <TableCell>
                          <Chip label={sale.status} size="small" color={mapStatusColor(sale.status)} />
                        </TableCell>
                        <TableCell>{formatDateTime(sale.sold_at)}</TableCell>
                        <TableCell align="right">
                          <IconButton color="primary" onClick={() => openStatusDialog(sale)}>
                            <EditRoundedIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            disabled={sale.status !== 'cancelled'}
                            onClick={() => handleDeleteSale(sale)}
                          >
                            <DeleteOutlineRoundedIcon />
                          </IconButton>
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

      <Dialog open={createOpen} onClose={closeCreateDialog} fullWidth maxWidth="md">
        <DialogTitle>Create Sale</DialogTitle>
        <Box component="form" onSubmit={handleCreateSale}>
          <DialogContent>
            <Stack spacing={3} sx={{ pt: 1 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Customer"
                  name="customer_id"
                  value={saleForm.customer_id}
                  onChange={handleSaleFieldChange}
                  fullWidth
                  required
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.customer_code} - {customer.first_name} {customer.last_name}
                    </MenuItem>
                  ))}
                </TextField>

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
                    <TextField
                      select
                      label={`Product ${index + 1}`}
                      value={item.product_id}
                      onChange={(event) => handleItemChange(index, 'product_id', event.target.value)}
                      fullWidth
                      required
                    >
                      {products.map((product) => (
                        <MenuItem key={product.id} value={product.id}>
                          {product.sku} - {product.name} ({product.stock_quantity} stock)
                        </MenuItem>
                      ))}
                    </TextField>

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
            <Button onClick={closeCreateDialog} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving...' : 'Create Sale'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={statusOpen} onClose={closeStatusDialog} fullWidth maxWidth="xs">
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
            <Button onClick={closeStatusDialog} disabled={statusSaving}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={statusSaving}>
              {statusSaving ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  )
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

function formatCustomerName(customer) {
  if (!customer) return 'Unknown Customer'
  return `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim()
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(value ?? 0))
}

function formatDateTime(value) {
  if (!value) return 'N/A'

  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatDateTimeForBackend(value) {
  return value ? value.replace('T', ' ') + ':00' : ''
}

function mapStatusColor(status) {
  if (status === 'paid') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'cancelled') return 'error'
  return 'default'
}

function getDefaultSoldAt() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

export default SalesPage
