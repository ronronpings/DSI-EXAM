import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
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
import CustomerModal from './CustomerModal/AddEditModal.jsx'

const initialForm = {
  customer_code: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  is_active: true,
}

function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    total: 0,
  })

  useEffect(() => {
    fetchCustomers()
  }, [pagination.page, pagination.rowsPerPage, deferredSearch])

  const fetchCustomers = async () => {
    try {
      setLoading(true)

      const { data } = await api.get('/customers', {
        params: {
          page: pagination.page + 1,
          per_page: pagination.rowsPerPage,
          search: deferredSearch || undefined,
        },
      })

      setCustomers(data.data ?? [])
      setPagination((current) => ({
        ...current,
        total: data.total ?? 0,
      }))
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load customers.'))
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingCustomer(null)
    setOpen(true)
  }

  const handleOpenEdit = (customer) => {
  setEditingCustomer(customer)
  setOpen(true)
}

  const handleClose = () => {
    if (saving) return
    setOpen(false)
  }

  // const handleChange = (event) => {
  //   const { name, value } = event.target

  //   if (name === 'is_active') {
  //     setForm((current) => ({
  //       ...current,
  //       is_active: value === 'true',
  //     }))
  //     return
  //   }

  //   setForm((current) => ({
  //     ...current,
  //     [name]: value,
  //   }))
  // }

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

      setOpen(false)
      fetchCustomers()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save customer.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(`Delete customer ${customer.first_name} ${customer.last_name}?`)

    if (!confirmed) return

    try {
      await api.delete(`/customers/${customer.id}`)
      toast.success('Customer deleted successfully.')

      if (customers.length === 1 && pagination.page > 0) {
        setPagination((current) => ({ ...current, page: current.page - 1 }))
      } else {
        fetchCustomers()
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete customer.'))
    }
  }


 
  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ width: '100%' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            Customers
          </Typography>
          <Typography color="text.secondary">
            Maintain buyer records used in transactions and reporting.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleOpenCreate}
          sx={{ height: 'fit-content', px: 3, mt: 0.5 }}
        >
          New Customer
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <TextField
              placeholder="Search by code, name, or email"
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
                    <TableCell>Code</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress size={24} sx={{ my: 4 }} />
                      </TableCell>
                    </TableRow>
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary" py={4}>
                          No customers found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow key={customer.id} hover>
                        <TableCell>{customer.customer_code}</TableCell>
                        <TableCell>{`${customer.first_name} ${customer.last_name}`}</TableCell>
                        <TableCell>{customer.email || 'N/A'}</TableCell>
                        <TableCell>{customer.phone || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={customer.is_active ? 'Active' : 'Inactive'}
                            color={customer.is_active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton color="primary" onClick={() => handleOpenEdit(customer)}>
                            <EditRoundedIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDelete(customer)}>
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

      <CustomerModal 
      open={open} 
      onClose={() => setOpen(false)} 
      editingCustomer={editingCustomer} 
      onSuccess={fetchCustomers} 
      />

    </Stack>
  )
}

export default CustomersPage
