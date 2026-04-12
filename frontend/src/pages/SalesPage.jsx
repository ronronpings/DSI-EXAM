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
import { CreateSaleModal, UpdateStatusModal, formatCurrency } from './SaleModal/AddEditSalse.jsx'

function SalesPage() {
  const [sales, setSales] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFetchingLookups, setIsFetchingLookups] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)
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
    try {
      setIsFetchingLookups(true)
      await fetchLookups()
      setCreateOpen(true)
    } finally {
      setIsFetchingLookups(false)
    }
  }

  const closeCreateDialog = () => {
    setCreateOpen(false)
  }

  const openStatusDialog = (sale) => {
    setSelectedSale(sale)
    setStatusOpen(true)
  }

  const closeStatusDialog = () => {
    setStatusOpen(false)
    setSelectedSale(null)
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

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ width: '100%' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            Sales
          </Typography>
          <Typography color="text.secondary">
            Create transactions, review invoices, and update sale status.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={isFetchingLookups ? <CircularProgress size={20} color="inherit" /> : <AddRoundedIcon />}
          onClick={openCreateDialog}
          disabled={isFetchingLookups}
          sx={{ height: 'fit-content', px: 3, mt: 0.5 }}
        >
          {isFetchingLookups ? 'Loading...' : 'Create Sale'}
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
                      <TableCell colSpan={7} align="center">
                        <CircularProgress size={24} sx={{ my: 4 }} />
                      </TableCell>
                    </TableRow>
                  ) : sales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="text.secondary" py={4}>
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

      <CreateSaleModal
        open={createOpen}
        onClose={closeCreateDialog}
        onSuccess={fetchSales}
        customers={customers}
        products={products}
      />

      <UpdateStatusModal
        open={statusOpen}
        onClose={closeStatusDialog}
        onSuccess={fetchSales}
        selectedSale={selectedSale}
      />
    </Stack>
  )
}

function formatCustomerName(customer) {
  if (!customer) return 'Unknown Customer'
  return `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim()
}

function formatDateTime(value) {
  if (!value) return 'N/A'

  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function mapStatusColor(status) {
  if (status === 'paid') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'cancelled') return 'error'
  return 'default'
}

export default SalesPage
