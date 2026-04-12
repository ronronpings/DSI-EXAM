import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import api from '../api/axios.js'

const metricConfig = [
  {
    key: 'sales_today',
    label: 'Sales Today',
    icon: <TrendingUpRoundedIcon />,
    tone: '#0f766e',
    money: true,
  },
  {
    key: 'sales_this_month',
    label: 'Monthly Revenue',
    icon: <ReceiptLongRoundedIcon />,
    tone: '#1d4ed8',
    money: true,
  },
  {
    key: 'total_products',
    label: 'Products',
    icon: <Inventory2RoundedIcon />,
    tone: '#7c3aed',
  },
  {
    key: 'total_customers',
    label: 'Customers',
    icon: <PeopleAltRoundedIcon />,
    tone: '#ea580c',
  },
]

function DashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const { data } = await api.get('/dashboard')
        setDashboard(data)
      } catch (err) {
        const message =
          err.response?.data?.message || 'Unable to load dashboard metrics at the moment.'

        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const metrics = dashboard?.metrics ?? {}
  const topProducts = dashboard?.top_products ?? []
  const lowStockProducts = dashboard?.low_stock_products ?? []
  const recentSales = dashboard?.recent_sales ?? []

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          Monitor revenue performance, stock movement, and recent transaction activity.
        </Typography>
      </Box>

      {loading ? (
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={24} />
              <Typography color="text.secondary">Loading dashboard metrics...</Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {error ? <Alert severity="error">{error}</Alert> : null}

      {!loading && !error ? (
        <>
          <Grid container spacing={3}>
            {metricConfig.map((item) => (
              <Grid key={item.key} size={{ xs: 12, sm: 6, xl: 3 }}>
                <Card>
                  <CardContent>
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 3,
                          display: 'grid',
                          placeItems: 'center',
                          backgroundColor: `${item.tone}18`,
                          color: item.tone,
                        }}
                      >
                        {item.icon}
                      </Box>

                      <Box>
                        <Typography color="text.secondary" variant="body2">
                          {item.label}
                        </Typography>
                        <Typography variant="h5">
                          {item.money ? formatCurrency(metrics[item.key]) : formatNumber(metrics[item.key])}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="h6">Top Products</Typography>
                    <Chip label={`${topProducts.length} items`} size="small" />
                  </Stack>

                  {topProducts.length === 0 ? (
                    <Typography color="text.secondary">No sales data available yet.</Typography>
                  ) : (
                    <List disablePadding>
                      {topProducts.map((item, index) => (
                        <Box key={item.product_id}>
                          <ListItem disableGutters>
                            <ListItemText
                              primary={item.product?.name ?? 'Unknown Product'}
                              secondary={`SKU: ${item.product?.sku ?? 'N/A'} | Qty sold: ${item.total_quantity}`}
                            />
                            <Typography fontWeight={700}>
                              {formatCurrency(item.total_revenue)}
                            </Typography>
                          </ListItem>
                          {index < topProducts.length - 1 ? <Divider /> : null}
                        </Box>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="h6">Low Stock Alerts</Typography>
                    <Chip
                      icon={<WarningAmberRoundedIcon />}
                      label={`${lowStockProducts.length} flagged`}
                      size="small"
                      color={lowStockProducts.length ? 'warning' : 'default'}
                    />
                  </Stack>

                  {lowStockProducts.length === 0 ? (
                    <Typography color="text.secondary">All tracked products have healthy stock levels.</Typography>
                  ) : (
                    <List disablePadding>
                      {lowStockProducts.map((product, index) => (
                        <Box key={product.id}>
                          <ListItem disableGutters>
                            <ListItemText
                              primary={product.name}
                              secondary={`SKU: ${product.sku}`}
                            />
                            <Chip
                              label={`${product.stock_quantity} left`}
                              color={product.stock_quantity <= 5 ? 'error' : 'warning'}
                              size="small"
                            />
                          </ListItem>
                          {index < lowStockProducts.length - 1 ? <Divider /> : null}
                        </Box>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6">Recent Sales</Typography>
                <Chip label={`${recentSales.length} latest`} size="small" />
              </Stack>

              {recentSales.length === 0 ? (
                <Typography color="text.secondary">No recent sales recorded yet.</Typography>
              ) : (
                <List disablePadding>
                  {recentSales.map((sale, index) => (
                    <Box key={sale.id}>
                      <ListItem disableGutters>
                        <ListItemText
                          primary={sale.invoice_number}
                          secondary={`${formatCustomerName(sale.customer)} | Cashier: ${sale.cashier?.name ?? 'N/A'} | ${formatDateTime(sale.sold_at)}`}
                        />
                        <Stack alignItems="flex-end" spacing={1}>
                          <Typography fontWeight={700}>{formatCurrency(sale.total_amount)}</Typography>
                          <Chip
                            label={sale.status}
                            size="small"
                            color={mapStatusColor(sale.status)}
                          />
                        </Stack>
                      </ListItem>
                      {index < recentSales.length - 1 ? <Divider /> : null}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </Stack>
  )
}

function formatCurrency(value) {
  const amount = Number(value ?? 0)

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-PH').format(Number(value ?? 0))
}

function formatCustomerName(customer) {
  if (!customer) {
    return 'Unknown Customer'
  }

  return `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim()
}

function formatDateTime(value) {
  if (!value) {
    return 'N/A'
  }

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

export default DashboardPage
