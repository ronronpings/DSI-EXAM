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
import ProductModal from './ProductModal/AddEditModal.jsx'

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    total: 0,
  })

  useEffect(() => {
    fetchProducts()
  }, [pagination.page, pagination.rowsPerPage, deferredSearch])

  const fetchProducts = async () => {
    try {
      setLoading(true)

      const { data } = await api.get('/products', {
        params: {
          page: pagination.page + 1,
          per_page: pagination.rowsPerPage,
          search: deferredSearch || undefined,
        },
      })

      setProducts(data.data ?? [])
      setPagination((current) => ({
        ...current,
        total: data.total ?? 0,
      }))
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load products.'))
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingProduct(null)
    setOpen(true)
  }

  const handleOpenEdit = (product) => {
    setEditingProduct(product)
    setOpen(true)
  }

  const handleDelete = async (product) => {
    const confirmed = window.confirm(`Delete product ${product.name}?`)

    if (!confirmed) return

    try {
      await api.delete(`/products/${product.id}`)
      toast.success('Product deleted successfully.')

      if (products.length === 1 && pagination.page > 0) {
        setPagination((current) => ({ ...current, page: current.page - 1 }))
      } else {
        fetchProducts()
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete product.'))
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ width: '100%' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            Products
          </Typography>
          <Typography color="text.secondary">
            Manage sellable inventory, pricing, active status, and stock levels.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleOpenCreate}
          sx={{ height: 'fit-content', px: 3, mt: 0.5 }}
        >
          Add Product
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <TextField
              placeholder="Search by SKU, name, or description"
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
                    <TableCell>SKU</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Stock</TableCell>
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
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary" py={4}>
                          No products found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id} hover>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography fontWeight={600}>{product.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {product.description || 'No description'}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{formatCurrency(product.price)}</TableCell>
                        <TableCell>{product.stock_quantity}</TableCell>
                        <TableCell>
                          <Chip
                            label={product.is_active ? 'Active' : 'Inactive'}
                            color={product.is_active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton color="primary" onClick={() => handleOpenEdit(product)}>
                            <EditRoundedIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDelete(product)}>
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

      <ProductModal
        open={open}
        onClose={() => setOpen(false)}
        editingProduct={editingProduct}
        onSuccess={fetchProducts}
      />
    </Stack>
  )
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(value ?? 0))
}

export default ProductsPage
