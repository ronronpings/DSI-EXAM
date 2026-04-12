import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material'

const metricCards = [
  { label: 'Sales Today', value: 'PHP 18,240', tone: '#0f766e' },
  { label: 'Monthly Revenue', value: 'PHP 425,800', tone: '#1d4ed8' },
  { label: 'Products', value: '128', tone: '#7c3aed' },
  { label: 'Customers', value: '312', tone: '#ea580c' },
]

function DashboardPage() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          Monitor sales performance, inventory movement, and recent activity.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {metricCards.map((item) => (
          <Grid key={item.label} size={{ xs: 12, sm: 6, xl: 3 }}>
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
                    <TrendingUpRoundedIcon />
                  </Box>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      {item.label}
                    </Typography>
                    <Typography variant="h5">{item.value}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ minHeight: 320 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Trend
              </Typography>
              <Typography color="text.secondary">
                Chart integration goes here once we connect live dashboard metrics.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ minHeight: 320 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Low Stock Alerts
              </Typography>
              <Typography color="text.secondary">
                This panel will show products that need replenishment soon.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  )
}

export default DashboardPage
